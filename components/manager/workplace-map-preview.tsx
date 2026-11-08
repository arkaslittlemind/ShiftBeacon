"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  setWorkerUrl,
  type GeoJSONSource,
} from "maplibre-gl";
import { useEffect, useRef } from "react";
import { circlePolygon, type Perimeter } from "@/lib/geo";

// MapLibre derives its worker URL from import.meta.url, which is not http(s)
// once Next bundles it, so the worker is emitted as an asset and passed in.
setWorkerUrl(
  new URL("../../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href
);

const SOURCE_ID = "geofence";
const STYLE_URL = "https://api.maptiler.com/maps/dataviz-light/style.json";
const MAX_FIT_DURATION_MS = 200;

type Props = {
  location: Perimeter;
  apiKey: string;
  onFailure: (reason: string) => void;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function fitToCircle(map: MapLibreMap, location: Perimeter, animate: boolean) {
  const bounds = new LngLatBounds();
  for (const [lon, lat] of circlePolygon(location, location.clockInRadiusMeters, 32)
    .coordinates[0]) {
    bounds.extend([lon, lat]);
  }
  const reduced = prefersReducedMotion();
  map.fitBounds(bounds, {
    padding: 32,
    maxZoom: 19,
    animate: animate && !reduced,
    duration: MAX_FIT_DURATION_MS,
  });
}

function applyLocation(
  map: MapLibreMap,
  marker: Marker,
  location: Perimeter,
  animate: boolean
) {
  const source = map.getSource<GeoJSONSource>(SOURCE_ID);
  source?.setData({
    type: "Feature",
    properties: {},
    geometry: circlePolygon(location, location.clockInRadiusMeters),
  });
  marker.setLngLat([location.longitude, location.latitude]);
  fitToCircle(map, location, animate);
}

export function WorkplaceMapPreview({ location, apiKey, onFailure }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const loadedRef = useRef(false);
  const locationRef = useRef(location);
  const onFailureRef = useRef(onFailure);

  useEffect(() => {
    onFailureRef.current = onFailure;
    locationRef.current = location;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // MapLibre paint properties cannot take var(), so the token is resolved here.
    const ocean = getComputedStyle(document.documentElement)
      .getPropertyValue("--ocean")
      .trim();
    const initial = locationRef.current;

    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container,
        style: `${STYLE_URL}?key=${encodeURIComponent(apiKey)}`,
        center: [initial.longitude, initial.latitude],
        zoom: 15,
        interactive: false,
        attributionControl: { compact: false },
      });
    } catch {
      onFailureRef.current("The map could not start in this browser.");
      return;
    }
    mapRef.current = map;

    const pin = document.createElement("div");
    pin.className = "size-4 rounded-full border-2 border-white bg-ocean shadow-md";
    const marker = new Marker({ element: pin });
    markerRef.current = marker;

    map.on("load", () => {
      loadedRef.current = true;
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: circlePolygon(initial, 1) },
      });
      map.addLayer({
        id: `${SOURCE_ID}-fill`,
        type: "fill",
        source: SOURCE_ID,
        paint: { "fill-color": ocean, "fill-opacity": 0.15 },
      });
      map.addLayer({
        id: `${SOURCE_ID}-line`,
        type: "line",
        source: SOURCE_ID,
        paint: { "line-color": ocean, "line-width": 1 },
      });
      marker.setLngLat([initial.longitude, initial.latitude]).addTo(map);
      applyLocation(map, marker, locationRef.current, false);
    });

    // Only errors before the first render are fatal: a failed style or key
    // leaves a blank grey box, while a later dropped tile leaves a usable map.
    // The message is never forwarded, since it can carry the request URL.
    map.on("error", () => {
      if (loadedRef.current) return;
      onFailureRef.current("The map could not be loaded.");
    });

    return () => {
      loadedRef.current = false;
      markerRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, [apiKey]);

  const { latitude, longitude, clockInRadiusMeters } = location;
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker || !loadedRef.current) return;
    applyLocation(map, marker, { latitude, longitude, clockInRadiusMeters }, true);
  }, [latitude, longitude, clockInRadiusMeters]);

  return <div ref={containerRef} className="size-full" />;
}
