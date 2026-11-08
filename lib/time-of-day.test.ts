import { describe, expect, it } from "vitest";
import { formatDateEyebrow, formatTimeOfDay } from "./time-of-day";

describe("formatTimeOfDay", () => {
  it("formats a 24-hour UTC time", () => {
    expect(formatTimeOfDay(new Date("2026-11-07T06:58:30.000Z"))).toBe("06:58");
    expect(formatTimeOfDay(new Date("2026-11-07T22:05:00.000Z"))).toBe("22:05");
  });
});

describe("formatDateEyebrow", () => {
  it("formats the weekday, day, and month", () => {
    expect(formatDateEyebrow(new Date("2026-11-10T12:00:00.000Z"))).toBe("Tuesday · 10 November");
  });

  it("uses the UTC day, not the host's local day", () => {
    expect(formatDateEyebrow(new Date("2026-11-10T23:59:00.000Z"))).toBe("Tuesday · 10 November");
    expect(formatDateEyebrow(new Date("2026-11-11T00:00:00.000Z"))).toBe(
      "Wednesday · 11 November"
    );
  });
});
