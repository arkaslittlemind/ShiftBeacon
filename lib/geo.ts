import { updateOrganizationSchema } from "@/lib/validation/organization";

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

type Coords = { latitude: number; longitude: number };
export type Perimeter = Coords & { clockInRadiusMeters: number };

/** For display only: the server re-runs the same rule and has the final say. */
export function perimeterCheck(
  coords: Coords,
  perimeter: Perimeter
): { inside: boolean; distanceMeters: number } {
  const distanceMeters = haversineDistanceMeters(
    coords.latitude,
    coords.longitude,
    perimeter.latitude,
    perimeter.longitude
  );
  return { inside: distanceMeters <= perimeter.clockInRadiusMeters, distanceMeters };
}

export function formatDistance(meters: number): string {
  if (meters < 100) return `${Math.round(meters)} m`;
  const roundedToTen = Math.round(meters / 10) * 10;
  if (roundedToTen < 1000) return `${roundedToTen} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: [number, number][][];
};

/**
 * A polygon approximating the geofence circle. It is a polygon rather than a
 * native map circle because map circle layers are sized in pixels, not meters.
 * Longitudes are left continuous (they may pass 180) so a circle over the
 * antimeridian does not tear into a world-wide sliver.
 */
export function circlePolygon(
  center: Coords,
  radiusMeters: number,
  steps = 64
): GeoJsonPolygon {
  const lat1 = toRadians(center.latitude);
  const angular = radiusMeters / EARTH_RADIUS_METERS;
  const ring: [number, number][] = [];

  for (let i = 0; i < steps; i++) {
    const bearing = (2 * Math.PI * i) / steps;
    const sinLat2 =
      Math.sin(lat1) * Math.cos(angular) +
      Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing);
    const lat2 = Math.asin(Math.min(1, Math.max(-1, sinLat2)));
    const dLon = Math.atan2(
      Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1),
      Math.cos(angular) - Math.sin(lat1) * sinLat2
    );
    ring.push([center.longitude + toDegrees(dLon), toDegrees(lat2)]);
  }

  ring.push(ring[0]);
  return { type: "Polygon", coordinates: [ring] };
}

/** Turns the form's raw strings into a usable location, or null mid-edit. */
export function parseDraftLocation(
  latitude: string,
  longitude: string,
  radius: string
): Perimeter | null {
  if ([latitude, longitude, radius].some((value) => value.trim() === "")) {
    return null;
  }

  const candidate = {
    latitude: Number(latitude),
    longitude: Number(longitude),
    clockInRadiusMeters: Number(radius),
  };
  if (!Object.values(candidate).every(Number.isFinite)) return null;

  const result = updateOrganizationSchema.safeParse(candidate);
  if (!result.success) return null;

  const { latitude: lat, longitude: lon, clockInRadiusMeters } = result.data;
  if (lat === undefined || lon === undefined || clockInRadiusMeters === undefined) {
    return null;
  }
  return { latitude: lat, longitude: lon, clockInRadiusMeters };
}
