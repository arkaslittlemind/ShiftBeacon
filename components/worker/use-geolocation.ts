"use client";

import { useEffect, useState } from "react";

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

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return {
        status: "unsupported",
        coords: null,
        error: "This browser doesn't support location. Clock-in isn't available here.",
      };
    }
    return { status: "prompting", coords: null, error: null };
  });

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
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
          setState({
            status: "denied",
            coords: null,
            error: "Location access was denied. Allow location for this site to clock in.",
          });
          return;
        }
        setState({
          status: "error",
          coords: null,
          error: "Couldn't determine your location. Check your device's location settings and try again.",
        });
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
}
