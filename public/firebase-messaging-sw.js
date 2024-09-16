importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Set Firebase configuration, once available
let appConfig = {};

const getAppConfigFromIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AppConfigDB', 1);

    request.onerror = (event) => reject('IndexedDB error: ' + event.target.error);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['appConfig'], 'readonly');
      const store = transaction.objectStore('appConfig');
      const getRequest = store.get('currentConfig');

      getRequest.onerror = (event) => reject('Error getting app config: ' + event.target.error);
      getRequest.onsuccess = (event) => resolve(event.target.result);
    };
  });
};

self.addEventListener('fetch', () => {
  const urlParams = new URLSearchParams(location.search);
  self.firebaseConfig = Object.fromEntries(urlParams);
});

// "Default" Firebase configuration (prevents errors)
const defaultConfig = {
  apiKey: true,
  projectId: true,
  messagingSenderId: true,
  appId: true,
};

// Initialize Firebase app
firebase.initializeApp(self.firebaseConfig || defaultConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(async (payload) => {
  try {
    appConfig = await getAppConfigFromIndexedDB();
    console.log('Retrieved app config from IndexedDB:', appConfig);
    console.log('Received background message:-', JSON.stringify(payload));
    const { title, body, image } = payload.notification;
    const notificationData = {
      title,
      body,
      icon: payload?.data?.icon || image,
      image: image,
      timestamp: Date.now(), // Add a timestamp
      ...payload.data,
    };
    console.log('Notification Content:', JSON.stringify(notificationData));

    const openDB = () => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('notificationDB', 1);

        request.onerror = (event) => reject('IndexedDB error: ' + event.target.error);

        request.onsuccess = (event) => resolve(event.target.result);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          db.createObjectStore('notifications', { keyPath: 'timestamp' });
        };
      });
    };

    const addData = (db, data) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['notifications'], 'readwrite');
        const store = transaction.objectStore('notifications');
        const request = store.add(data);

        request.onerror = (event) => reject('Error adding data: ' + event.target.error);
        request.onsuccess = (event) => resolve(event.target.result);
      });
    };

    const db = await openDB();
    await addData(db, notificationData);
    console.log('Notification data stored successfully');

    const eventData = {
      botId: appConfig.NEXT_PUBLIC_BOT_ID || '',
      orgId: appConfig.NEXT_PUBLIC_ORG_ID || '',
      userId: appConfig.userId || '',
      phoneNumber: appConfig.phoneNumber || '',
      conversationId: appConfig.conversationId || '',
    };

    const telemetryData = {
      generator: appConfig.NEXT_PUBLIC_BOT_NAME,
      version: '0.1',
      timestamp: Math.floor(new Date().getTime() / 1000),
      actorId: appConfig.userId || '',
      actorType: 'user',
      env: appConfig.NODE_ENV,
      eventId: 'E046',
      event: 'aiToolProxyToolLatency',
      subEvent: 's2tLatency',
      os: appConfig.os || 'unknown',
      browser: appConfig.browser || 'unknown',
      ip: appConfig.ip || '',
      deviceType: appConfig.deviceType || 'unknown',
      sessionId: appConfig.sessionId || '',
      eventData,
    };
    console.log('telemetry data is here', telemetryData);

    await fetch(appConfig.telemetryApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        orgId: appConfig.NEXT_PUBLIC_ORG_ID || '',
      },
      body: JSON.stringify([telemetryData]),
    });
    console.log('Telemetry api called successfully');

    return self.registration.showNotification(title, notificationData);
  } catch (error) {
    console.error('Error saving telemetry event:', error);
  }
});
