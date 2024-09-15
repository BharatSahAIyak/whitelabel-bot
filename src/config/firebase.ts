import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: String(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: String(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: String(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: String(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: String(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: String(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  measurementId: String(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),
};

let app: any;
let messaging: any;

export const initializeFirebase = () => {
  if (typeof window !== 'undefined' && !getApps().length) {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    console.log('Firebase initialized');
  } else {
    console.log('Firebase already initialized or running on the server');
  }
};

export const requestForToken = async () => {
  if (!messaging) {
    console.error('Firebase is not initialized. Please initialize Firebase first.');
    return null;
  }

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      });
      if (currentToken) {
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    } catch (err) {
      console.error('An error occurred while retrieving token:', err);
      return null;
    }
  } else {
    console.error('Service Worker is not supported in this browser.');
    return null;
  }
};

export const onMessageListener = () => {
  if (!messaging) {
    console.error('Firebase is not initialized. Please initialize Firebase first.');
    return Promise.reject('Firebase not initialized');
  }

  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    } else {
      resolve(null);
    }
  });
};
