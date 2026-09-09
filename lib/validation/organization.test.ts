import { describe, expect, it } from "vitest";
import { updateOrganizationSchema } from "./organization";

describe("updateOrganizationSchema", () => {
  it("accepts a valid partial update (single field)", () => {
    expect(updateOrganizationSchema.safeParse({ name: "Riverside Care Home" }).success).toBe(
      true
    );
  });

  it("accepts a valid full update", () => {
    const result = updateOrganizationSchema.safeParse({
      name: "Riverside Care Home",
      latitude: 51.5074,
      longitude: -0.1278,
      clockInRadiusMeters: 200,
    });
    expect(result.success).toBe(true);
  });

  it("accepts boundary latitude/longitude values", () => {
    expect(
      updateOrganizationSchema.safeParse({ latitude: 90, longitude: 180 }).success
    ).toBe(true);
    expect(
      updateOrganizationSchema.safeParse({ latitude: -90, longitude: -180 }).success
    ).toBe(true);
  });

  it("rejects an empty object", () => {
    expect(updateOrganizationSchema.safeParse({}).success).toBe(false);
  });

  it("rejects out-of-range latitude/longitude", () => {
    expect(updateOrganizationSchema.safeParse({ latitude: 90.1 }).success).toBe(false);
    expect(updateOrganizationSchema.safeParse({ longitude: -180.1 }).success).toBe(false);
  });

  it("rejects a non-positive clock-in radius", () => {
    expect(updateOrganizationSchema.safeParse({ clockInRadiusMeters: 0 }).success).toBe(
      false
    );
    expect(updateOrganizationSchema.safeParse({ clockInRadiusMeters: -5 }).success).toBe(
      false
    );
  });

  it("rejects a non-integer clock-in radius", () => {
    expect(updateOrganizationSchema.safeParse({ clockInRadiusMeters: 1.5 }).success).toBe(
      false
    );
  });

  it("rejects an empty name", () => {
    expect(updateOrganizationSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(updateOrganizationSchema.safeParse({ latitude: "51.5074" }).success).toBe(false);
  });
});
