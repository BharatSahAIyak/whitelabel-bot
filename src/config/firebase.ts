// src/config/firebase.ts

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyBfIRl85DzIo2ESE9nePkQh49VmdbnQd7k',
  authDomain: 'test-account-827a9.firebaseapp.com',
  projectId: 'test-account-827a9',
  storageBucket: 'test-account-827a9.appspot.com',
  messagingSenderId: '960328825304',
  appId: '1:960328825304:web:b8d9bb807f0942b6d39aad',
  measurementId: 'G-24400FF6J6',
};

let app;
let messaging: any;

export const initializeFirebase = () => {
  if (typeof window !== 'undefined' && !getApps().length) {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  }
};

export const requestForToken = async () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      });
      if (currentToken) {
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } catch (err) {
      console.log('An error occurred while retrieving token:', err);
    }
  }
  return null;
};

export const onMessageListener = () => {
  if (typeof window !== 'undefined') {
    return new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    });
  }
  return Promise.resolve(null);
};
