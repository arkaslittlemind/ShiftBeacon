import { describe, expect, it } from "vitest";
import {
  circlePolygon,
  formatDistance,
  haversineDistanceMeters,
  parseDraftLocation,
  perimeterCheck,
} from "./geo";

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

describe("perimeterCheck", () => {
  const organization = { latitude: 51.5, longitude: -0.12, clockInRadiusMeters: 150 };

  it("is inside with the distance when within the radius", () => {
    const point = metersNorth(51.5, -0.12, 42);
    const result = perimeterCheck({ latitude: point.lat, longitude: point.lon }, organization);
    expect(result.inside).toBe(true);
    expect(result.distanceMeters).toBeCloseTo(42, 3);
  });

  it("counts a point exactly on the radius as inside, matching the server rule", () => {
    const point = metersNorth(51.5, -0.12, 150);
    const result = perimeterCheck({ latitude: point.lat, longitude: point.lon }, organization);
    expect(result.distanceMeters).toBeCloseTo(150, 6);
    expect(result.inside).toBe(result.distanceMeters <= 150);
  });

  it("is outside when beyond the radius", () => {
    const point = metersNorth(51.5, -0.12, 380);
    const result = perimeterCheck({ latitude: point.lat, longitude: point.lon }, organization);
    expect(result.inside).toBe(false);
    expect(result.distanceMeters).toBeCloseTo(380, 3);
  });
});

describe("formatDistance", () => {
  it("shows whole metres under 100 m", () => {
    expect(formatDistance(0)).toBe("0 m");
    expect(formatDistance(42.4)).toBe("42 m");
    expect(formatDistance(99)).toBe("99 m");
  });

  it("rounds to the nearest 10 m from 100 m", () => {
    expect(formatDistance(100)).toBe("100 m");
    expect(formatDistance(384)).toBe("380 m");
    expect(formatDistance(385)).toBe("390 m");
  });

  it("never shows 1000 m, switching to kilometres instead", () => {
    expect(formatDistance(996)).toBe("1.0 km");
    expect(formatDistance(999)).toBe("1.0 km");
  });

  it("shows kilometres with one decimal from 1000 m", () => {
    expect(formatDistance(1000)).toBe("1.0 km");
    expect(formatDistance(1249)).toBe("1.2 km");
    expect(formatDistance(12_340)).toBe("12.3 km");
  });
});

describe("circlePolygon", () => {
  const centers = [
    { latitude: 51.5074, longitude: -0.1278 },
    { latitude: 0, longitude: 0 },
    { latitude: -33.9, longitude: 151.2 },
  ];

  it.each(centers)("keeps every vertex on the radius around %o", (center) => {
    const ring = circlePolygon(center, 800, 64).coordinates[0];
    for (const [lon, lat] of ring) {
      const d = haversineDistanceMeters(center.latitude, center.longitude, lat, lon);
      expect(Math.abs(d - 800)).toBeLessThan(0.5);
    }
  });

  it("returns a closed ring with steps + 1 points", () => {
    const ring = circlePolygon(centers[0], 200, 32).coordinates[0];
    expect(ring).toHaveLength(33);
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });

  it("never produces NaN at the poles or the antimeridian", () => {
    const spots = [
      { latitude: 90, longitude: 0 },
      { latitude: -90, longitude: 0 },
      { latitude: 89.9999, longitude: 10 },
      { latitude: 0, longitude: 180 },
      { latitude: 0, longitude: -180 },
    ];
    for (const spot of spots) {
      const ring = circlePolygon(spot, 5000, 16).coordinates[0];
      expect(ring.flat().every(Number.isFinite)).toBe(true);
    }
  });

  it("keeps longitudes continuous across the antimeridian", () => {
    const ring = circlePolygon({ latitude: 0, longitude: 180 }, 5000, 16).coordinates[0];
    const lons = ring.map(([lon]) => lon);
    expect(Math.max(...lons) - Math.min(...lons)).toBeLessThan(1);
  });
});

describe("parseDraftLocation", () => {
  it("returns a location for valid strings", () => {
    expect(parseDraftLocation("51.5", "-0.12", "200")).toEqual({
      latitude: 51.5,
      longitude: -0.12,
      clockInRadiusMeters: 200,
    });
  });

  it.each([
    ["", "-0.12", "200"],
    ["51.5", "  ", "200"],
    ["abc", "-0.12", "200"],
    ["91", "0", "200"],
    ["0", "-181", "200"],
    ["51.5", "-0.12", "0"],
    ["51.5", "-0.12", "-5"],
    ["51.5", "-0.12", "1e999"],
    ["1e999", "0", "200"],
  ])("returns null for %j, %j, %j", (lat, lon, radius) => {
    expect(parseDraftLocation(lat, lon, radius)).toBeNull();
  });
});
