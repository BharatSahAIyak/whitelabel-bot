// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBfIRl85DzIo2ESE9nePkQh49VmdbnQd7k',
  authDomain: 'test-account-827a9.firebaseapp.com',
  projectId: 'test-account-827a9',
  storageBucket: 'test-account-827a9.appspot.com',
  messagingSenderId: '960328825304',
  appId: '1:960328825304:web:3614ec0389ddd04ed39aad',
  measurementId: 'G-R4PVYNTJFK',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const link = payload.fcmOptions?.link || payload.data?.url;

  const notificationOptions = {
    body: payload.notification.body,
    icon: './vercel.svg',
    image: payload.notification?.image,
    data: { url: link },
  };
  console.log('Notification Content:', notificationOptions);

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();
  const notificationData = {
    title: event.notification.title,
    body: event.notification.body,
    image: event.notification.image,
    url: event.notification.data.url,
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

  // event.waitUntil(
  //   Promise.all([

  //     // Open or focus the window
  //     console.log('[firebase-messaging-sw.js] Notification click received 2.'),

  //     clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
  //       const url = event.notification.data.url;
  //       console.log('[firebase-messaging-sw.js] Notification click received 3.', url);

  //       if (!url) return;
  //       console.log('[firebase-messaging-sw.js] Notification click received 4.', url);

  //       for (const client of clientList) {
  //         console.log(
  //           '[firebase-messaging-sw.js] Notification click received 5.',
  //           client,
  //           clientList
  //         );

  //         if (client.url === url && 'focus' in client) {
  //           return client.focus();
  //         }
  //       }

  //       if (clients.openWindow) {
  //         console.log('Opening new window for URL:', url);
  //         return clients.openWindow(url);
  //       }
  //     }),
  //   ])
  // );
});
