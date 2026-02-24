import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  type Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }
  app = initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === "undefined") return null;
  if (messaging) return messaging;
  try {
    const firebaseApp = getFirebaseApp();
    messaging = getMessaging(firebaseApp);
    return messaging;
  } catch (err) {
    console.error("Failed to get Firebase Messaging:", err);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const fcmMessaging = getFirebaseMessaging();
    if (!fcmMessaging) return null;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const token = await getToken(fcmMessaging, { vapidKey });
    return token;
  } catch (err) {
    console.error("Failed to get FCM token:", err);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: unknown) => void) {
  const fcmMessaging = getFirebaseMessaging();
  if (!fcmMessaging) return;
  onMessage(fcmMessaging, (payload) => {
    callback(payload);
  });
}
