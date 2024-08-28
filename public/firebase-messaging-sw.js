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
    timestamp: Date.now(), // Add a timestamp
    ...payload.data,
  };
  console.log('Notification Content:', JSON.stringify(notificationData));

  // Function to open IndexedDB
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

  // Function to add data to IndexedDB
  const addData = (db, data) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['notifications'], 'readwrite');
      const store = transaction.objectStore('notifications');
      const request = store.add(data);

      request.onerror = (event) => reject('Error adding data: ' + event.target.error);
      request.onsuccess = (event) => resolve(event.target.result);
    });
  };

  // Store notification data
  openDB()
    .then((db) => addData(db, notificationData))
    .then(() => console.log('Notification data stored successfully'))
    .catch((error) => console.error('Failed to store notification:', error));

  // Uncomment the following line if you want to show the notification
  // return self.registration.showNotification(title, notificationData);
});
