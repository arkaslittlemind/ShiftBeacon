"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export type GeolocationStatus =
  | "idle"
  | "prompting"
  | "granted"
  | "denied"
  | "unsupported"
  | "error";

export type GeolocationCoords = {
  latitude: number;
  longitude: number;
};

export type GeolocationState = {
  status: GeolocationStatus;
  coords: GeolocationCoords | null;
  error: string | null;
};

const IDLE: GeolocationState = { status: "idle", coords: null, error: null };
const PROMPTING: GeolocationState = { status: "prompting", coords: null, error: null };
const UNSUPPORTED: GeolocationState = {
  status: "unsupported",
  coords: null,
  error: "This browser doesn't support location. Clock-in isn't available here.",
};

// Support never changes during a page's life, so there is nothing to subscribe to.
const subscribeToNothing = () => () => {};
const isSupportedInBrowser = () => Boolean(navigator.geolocation);
// The server cannot know (and Node's own `navigator` has no geolocation), so it
// reports "unknown". React reuses this snapshot for the hydrating render, which
// keeps the first client render identical to the server HTML.
const isSupportedOnServer = () => null;

export function useGeolocation(): GeolocationState {
  const supported = useSyncExternalStore(
    subscribeToNothing,
    isSupportedInBrowser,
    isSupportedOnServer
  );
  const [watchResult, setWatchResult] = useState<GeolocationState | null>(null);

  useEffect(() => {
    const geolocation = navigator.geolocation;
    if (!geolocation) {
      return;
    }

    const watchId = geolocation.watchPosition(
      (position) => {
        setWatchResult({
          status: "granted",
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setWatchResult({
            status: "denied",
            coords: null,
            error: "Location access was denied. Allow location for this site to clock in.",
          });
          return;
        }
        setWatchResult({
          status: "error",
          coords: null,
          error: "Couldn't determine your location. Check your device's location settings and try again.",
        });
      },
      { enableHighAccuracy: true }
    );

    return () => geolocation.clearWatch(watchId);
  }, []);

  if (supported === null) return IDLE;
  if (!supported) return UNSUPPORTED;
  return watchResult ?? PROMPTING;
}
