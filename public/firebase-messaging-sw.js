importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts(
  'https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js'
);

// Set Firebase configuration, once available
self.addEventListener('fetch', () => {
  const urlParams = new URLSearchParams(location.search);
  self.firebaseConfig = Object.fromEntries(urlParams);
});

// "Default" Firebase configuration  
const defaultConfig = {
  apiKey: true,
  projectId: true,
  messagingSenderId: true,
  appId: true,
};

// Initialize Firebase app
firebase.initializeApp(self.firebaseConfig || defaultConfig);
const messaging = firebase.messaging();

// Function to retrieve notifications from IndexedDB
function getStoredNotifications() {
  return new Promise((resolve, reject) => {
    const request = self.indexedDB.open('notificationDataDB', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['notificationDataStore'], 'readonly');
      const objectStore = transaction.objectStore('notificationDataStore');

      const notifications = [];
      objectStore.openCursor().onsuccess = (cursorEvent) => {
        const cursor = cursorEvent.target.result;
        if (cursor) {
          notifications.push(cursor.value.payload.notification);
          cursor.continue();
        } else {
          resolve(notifications);
        }
      };

      transaction.oncomplete = () => {
        db.close();
      };
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}



messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);

   
  storeNotificationData(payload);

  const { title, body, image } = payload.notification;

  const notificationOptions = {
    body,
    icon: image,
    tag: 'notification',
    vibrate: [200, 100, 200],
    renotify: true,
    data: { url: payload.data?.[`gcm.notification.data`] },
  };

   
  notificationOptions.data.featureDetails =
    payload.data?.[`gcm.notification.featureDetails`];

  self.registration.showNotification(title, notificationOptions);
});

 
self.addEventListener('notificationclick', (event) => {
  console.log('hi', event);
  if (event.notification.data && event.notification.data.url) {
    self.clients.openWindow(event.notification.data.url);
  } else {
    self.clients.openWindow(event.currentTarget.origin);
  } 
  const featureDetails = event.notification.data.featureDetails;
  const parsedFeatureDetails = JSON.parse(featureDetails);
  if (
    featureDetails &&
    parsedFeatureDetails?.title &&
    parsedFeatureDetails?.description
  ) {
    // Store the feature details in IndexedDB
    storeFeatureDetails(featureDetails);
  }
   
  event.notification.close();
});

function storeNotificationData(payload) {
 
  const request = self.indexedDB.open('notificationDataDB', 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
  
    if (!db.objectStoreNames.contains('notificationDataStore')) {
       
      db.createObjectStore('notificationDataStore', {
        keyPath: 'id',
        autoIncrement: true,
      });
    }
  };

  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['notificationDataStore'], 'readwrite');
    const objectStore = transaction.objectStore('notificationDataStore');

     
    objectStore.add({ payload });

    transaction.oncomplete = () => {
      db.close();
    };
  };
}
