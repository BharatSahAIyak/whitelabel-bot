importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: true,
  authDomain: true,
  projectId: true,
  storageBucket: true,
  messagingSenderId: true,
  appId: true,
  measurementId: true,
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', JSON.stringify(payload));
  const { title, body, image } = payload.notification;

  // Customize notification here
  const sideLogo = payload.data.sideLogo;

  const notificationOptions = {
    body,
    icon: sideLogo,
    image: image,
    tag: 'notification',
    renotify: true,
    data: { ...payload.data },
  };
  console.log('Notification Content:', JSON.stringify(notificationOptions));

  self.registration.showNotification(title, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();
  const notificationData = {
    title: event.notification.title,
    body: event.notification.body,
    image: event.notification.image,
    url: event.notification.data?.url,
    buttonText: event.notification.data?.buttonText,
    buttonUrl: event.notification.data?.buttonUrl,
    timestamp: new Date().getTime(),
  };
  console.log('[firebase-messaging-sw.js] Notification click received 1 .', notificationData);

  event.waitUntil(
    (async () => {
      try {
        // Store notification data in IndexedDB
        const dbPromise = self.indexedDB.open('notificationDB', 1);

        dbPromise.onupgradeneeded = (event) => {
          const db = event.target.result;
          db.createObjectStore('notifications', { keyPath: 'timestamp' });
        };

        dbPromise.onsuccess = async (event) => {
          const db = event.target.result;
          const transaction = db.transaction('notifications', 'readwrite');
          const store = transaction.objectStore('notifications');
          await store.put(notificationData);
          console.log('Notification data stored:', notificationData);
        };

        const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
        if (notificationData.url) {
          for (const client of clientList) {
            if (client.url === notificationData.url && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(notificationData.url);
          }
        }
      } catch (error) {
        console.error('Error handling notification click:', error);
      }
    })()
  );
});
