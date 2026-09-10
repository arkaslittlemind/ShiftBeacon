"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failing (unsupported browser, blocked by policy, etc.)
      // should never break the rest of the app.
    });
  }, []);

  return null;
}
