importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Set Firebase configuration, once available
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

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', JSON.stringify(payload));
  const { title, body, image } = payload.notification;

  const notificationData = {
    title,
    body,
    icon: payload.data.sideLogo,
    image: image,
    ...payload.data,
  };
  console.log('Notification Content:', JSON.stringify(notificationData));

  // return self.registration.showNotification(title, notificationData);
});
