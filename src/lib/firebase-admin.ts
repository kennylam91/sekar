import { App, initializeApp, getApps, cert } from "firebase-admin/app";
import { Messaging } from "firebase-admin/messaging";
import { getMessaging as getFirebaseMessaging } from "firebase-admin/messaging";

function getFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  try {
    return initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.NEXT_FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.NEXT_FIREBASE_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n",
        ),
      }),
    });
  } catch (err) {
    console.error("Failed to initialize Firebase Admin:", err);
    return null;
  }
}

export function getMessaging(): Messaging | null {
  const app = getFirebaseAdmin();
  if (!app) return null;
  return getFirebaseMessaging(app);
}
