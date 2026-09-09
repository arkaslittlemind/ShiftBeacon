import { describe, expect, it } from "vitest";
import { clockInSchema, clockOutSchema } from "./shift";

describe("clockInSchema", () => {
  it("accepts valid input", () => {
    const result = clockInSchema.safeParse({ latitude: 51.5074, longitude: -0.1278 });
    expect(result.success).toBe(true);
  });

  it("accepts an optional note", () => {
    const result = clockInSchema.safeParse({
      latitude: 51.5074,
      longitude: -0.1278,
      note: "Covering handover",
    });
    expect(result.success).toBe(true);
  });

  it("accepts boundary latitude/longitude values", () => {
    expect(clockInSchema.safeParse({ latitude: 90, longitude: 180 }).success).toBe(true);
    expect(clockInSchema.safeParse({ latitude: -90, longitude: -180 }).success).toBe(true);
  });

  it("rejects out-of-range latitude/longitude", () => {
    expect(clockInSchema.safeParse({ latitude: 90.1, longitude: 0 }).success).toBe(false);
    expect(clockInSchema.safeParse({ latitude: 0, longitude: 180.1 }).success).toBe(false);
  });

  it("rejects missing required fields", () => {
    expect(clockInSchema.safeParse({ latitude: 0 }).success).toBe(false);
    expect(clockInSchema.safeParse({}).success).toBe(false);
  });

  it("rejects wrong types", () => {
    expect(clockInSchema.safeParse({ latitude: "0", longitude: 0 }).success).toBe(false);
  });

  it("rejects an empty note", () => {
    expect(
      clockInSchema.safeParse({ latitude: 0, longitude: 0, note: "" }).success
    ).toBe(false);
  });
});

describe("clockOutSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    expect(clockOutSchema.safeParse({}).success).toBe(true);
  });

  it("accepts valid coordinates and note together", () => {
    const result = clockOutSchema.safeParse({
      latitude: 51.5074,
      longitude: -0.1278,
      note: "Handover complete",
    });
    expect(result.success).toBe(true);
  });

  it("rejects out-of-range coordinates when provided", () => {
    expect(clockOutSchema.safeParse({ latitude: 91 }).success).toBe(false);
    expect(clockOutSchema.safeParse({ longitude: -181 }).success).toBe(false);
  });

  it("rejects an empty note when provided", () => {
    expect(clockOutSchema.safeParse({ note: "" }).success).toBe(false);
  });
});
