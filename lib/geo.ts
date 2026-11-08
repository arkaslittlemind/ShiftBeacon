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
