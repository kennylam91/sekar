/* eslint-disable no-undef */
// Firebase Messaging Service Worker
// This runs in the background and handles push notifications
// even when the app is not open.

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

// Firebase config will be passed via the messaging token request
// but we need a fallback config for the service worker
firebase.initializeApp({
  apiKey: "placeholder",
  authDomain: "placeholder",
  projectId: "placeholder",
  storageBucket: "placeholder",
  messagingSenderId: "placeholder",
  appId: "placeholder",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  const notificationTitle = payload.notification?.title || "Sekar";
  const notificationOptions = {
    body: payload.notification?.body || "Bạn có thông báo mới",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: {
      url: payload.fcmOptions?.link || "/",
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
