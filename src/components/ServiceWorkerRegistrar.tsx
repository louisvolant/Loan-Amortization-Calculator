// src/components/ServiceWorkerRegistrar.tsx
"use client";

import { useEffect } from "react";

/**
 * Registers the service worker so the app can be installed as a PWA
 * and serve its static shell offline once cached.
 *
 * Registration is intentionally skipped outside production builds to keep
 * local development and the Playwright test suite free of stale caches.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("[PWA] Service worker registered:", registration.scope);
      } catch (err) {
        console.error("[PWA] Service worker registration failed:", err);
      }
    };

    void register();
  }, []);

  return null;
}