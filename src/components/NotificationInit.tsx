"use client";

import { useEffect, useRef } from "react";
import {
  requestNotificationPermission,
  onForegroundMessage,
} from "@/lib/firebase-client";

export const NOTIFICATIONS_STORAGE_KEY = "sekar_notifications";

/**
 * Component that initializes FCM for logged-in drivers.
 * Requests notification permission and registers the FCM token.
 * Also handles foreground message display.
 */
export default function NotificationInit() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      // Check if notifications are supported
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        console.log("Notifications not supported in this browser");
        return;
      }

      // Respect user preference: skip if explicitly disabled
      if (localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) === "false") {
        return;
      }

      // Register service worker
      let swReg: ServiceWorkerRegistration;
      try {
        swReg = await navigator.serviceWorker.register("/api/firebase-sw", {
          scope: "/",
        });
      } catch (err) {
        console.error("Service worker registration failed:", err);
        return;
      }

      // Request permission and get token
      const token = await requestNotificationPermission(swReg);
      if (!token) return;

      // Send token to server
      try {
        await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        console.log("FCM token registered successfully");
      } catch (err) {
        console.error("Failed to register FCM token:", err);
      }

      // Handle foreground messages
      onForegroundMessage((payload) => {
        // Payload uses data-only fields — see notifications.ts for rationale.
        const msg = payload as {
          data?: { title?: string; body?: string; url?: string };
        };
        const title = msg.data?.title;
        const body = msg.data?.body;
        if (title || body) {
          // Use service worker to show notification — works on mobile & desktop
          swReg.showNotification(title || "Sekar", {
            body: body || "",
            icon: "/icon-192.svg",
            badge: "/icon-192.svg",
            data: { url: msg.data?.url || "/" },
          });
        }
      });
    }

    init();
  }, []);

  return null;
}
