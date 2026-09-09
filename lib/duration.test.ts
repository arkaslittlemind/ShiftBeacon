import { describe, expect, it } from "vitest";
import { formatElapsedClock, formatHoursDecimal } from "./duration";

describe("formatElapsedClock", () => {
  it("formats zero as 00:00:00", () => {
    expect(formatElapsedClock(0)).toBe("00:00:00");
  });

  it("clamps negative input to zero", () => {
    expect(formatElapsedClock(-5000)).toBe("00:00:00");
  });

  it("formats a sub-minute duration", () => {
    expect(formatElapsedClock(5_000)).toBe("00:00:05");
  });

  it("formats a sub-hour duration", () => {
    expect(formatElapsedClock(125_000)).toBe("00:02:05");
  });

  it("rolls over correctly at 59:59", () => {
    expect(formatElapsedClock(59 * 60_000 + 59_000)).toBe("00:59:59");
  });

  it("rolls over correctly at exactly 60 minutes", () => {
    expect(formatElapsedClock(60 * 60_000)).toBe("01:00:00");
  });

  it("formats exactly 1 hour the same as 60 minutes", () => {
    expect(formatElapsedClock(60 * 60_000)).toBe(formatElapsedClock(3_600_000));
  });
});

describe("formatHoursDecimal", () => {
  it("formats zero as 0.0h", () => {
    expect(formatHoursDecimal(0)).toBe("0.0h");
  });

  it("clamps negative input to 0.0h", () => {
    expect(formatHoursDecimal(-3_600_000)).toBe("0.0h");
  });

  it("formats exactly 1 hour as 1.0h", () => {
    expect(formatHoursDecimal(3_600_000)).toBe("1.0h");
  });

  it("formats 1.5 hours as 1.5h", () => {
    expect(formatHoursDecimal(5_400_000)).toBe("1.5h");
  });

  it("rounds a repeating decimal to one place", () => {
    // 100 minutes = 1.6666...h -> rounds to 1.7h
    expect(formatHoursDecimal(100 * 60_000)).toBe("1.7h");
  });
});
