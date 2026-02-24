import admin from "firebase-admin";

function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.warn(
      "FIREBASE_SERVICE_ACCOUNT_KEY not set — push notifications disabled",
    );
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (err) {
    console.error("Failed to initialize Firebase Admin:", err);
    return null;
  }
}

export function getMessaging(): admin.messaging.Messaging | null {
  const app = getFirebaseAdmin();
  if (!app) return null;
  return admin.messaging(app);
}
