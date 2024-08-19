// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBfIRl85DzIo2ESE9nePkQh49VmdbnQd7k',
  authDomain: 'test-account-827a9.firebaseapp.com',
  projectId: 'test-account-827a9',
  storageBucket: 'test-account-827a9.appspot.com',
  messagingSenderId: '960328825304',
  appId: '1:960328825304:web:b8d9bb807f0942b6d39aad',
  measurementId: 'G-24400FF6J6',
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

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      const url = event.notification.data.url;

      if (!url) return;

      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        console.log('Opening new window for URL:', url);
        return clients.openWindow(url);
      }
    })
  );
});
