import { describe, expect, it } from "vitest";
import { haversineDistanceMeters } from "./geo";

const EARTH_RADIUS_METERS = 6371000;

/** Exact for a pure north/south offset on this module's spherical model: the
 * great-circle distance along a meridian equals R * deltaLatitudeRadians. */
function metersNorth(lat: number, lon: number, meters: number) {
  const deltaLat = (meters / EARTH_RADIUS_METERS) * (180 / Math.PI);
  return { lat: lat + deltaLat, lon };
}

describe("haversineDistanceMeters", () => {
  it("returns 0 for the same point", () => {
    expect(haversineDistanceMeters(51.5074, -0.1278, 51.5074, -0.1278)).toBe(0);
  });

  it("matches a known real-world distance (London to Paris) within 1%", () => {
    const distance = haversineDistanceMeters(51.5074, -0.1278, 48.8566, 2.3522);
    expect(distance).toBeGreaterThan(343_500 * 0.99);
    expect(distance).toBeLessThan(343_500 * 1.01);
  });

  it("computes an exact meridian offset", () => {
    const origin = { lat: 51.5074, lon: -0.1278 };
    const target = metersNorth(origin.lat, origin.lon, 200);
    const distance = haversineDistanceMeters(origin.lat, origin.lon, target.lat, target.lon);
    expect(distance).toBeCloseTo(200, 6);
  });

  describe("geofence boundary behavior", () => {
    const origin = { lat: 51.5074, lon: -0.1278 };
    const radius = 200;

    it("is within radius when exactly at the radius", () => {
      const atRadius = metersNorth(origin.lat, origin.lon, radius);
      const distance = haversineDistanceMeters(origin.lat, origin.lon, atRadius.lat, atRadius.lon);
      expect(distance).toBeCloseTo(radius, 6);
      expect(distance <= radius).toBe(true);
    });

    it("is within radius when just inside", () => {
      const justInside = metersNorth(origin.lat, origin.lon, radius - 1);
      const distance = haversineDistanceMeters(
        origin.lat,
        origin.lon,
        justInside.lat,
        justInside.lon
      );
      expect(distance <= radius).toBe(true);
    });

    it("is outside radius when just outside", () => {
      const justOutside = metersNorth(origin.lat, origin.lon, radius + 1);
      const distance = haversineDistanceMeters(
        origin.lat,
        origin.lon,
        justOutside.lat,
        justOutside.lon
      );
      expect(distance <= radius).toBe(false);
    });
  });
});
