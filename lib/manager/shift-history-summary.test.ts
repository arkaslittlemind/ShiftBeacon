import { describe, expect, it } from "vitest";
import { summarizeShiftHistory } from "./shift-history-summary";
import type { ShiftResponse } from "@/types/shift";

function shift(clockInAt: string, clockOutAt: string | null): ShiftResponse {
  return {
    id: `${clockInAt}-${clockOutAt}`,
    clockInAt,
    clockInLatitude: 51.5,
    clockInLongitude: -0.12,
    clockInNote: null,
    clockOutAt,
    clockOutLatitude: clockOutAt ? 51.5 : null,
    clockOutLongitude: clockOutAt ? -0.12 : null,
    clockOutNote: null,
  };
}

const HOUR = 3_600_000;

describe("summarizeShiftHistory", () => {
  it("returns zeros for an empty history", () => {
    expect(summarizeShiftHistory([])).toEqual({ shiftCount: 0, totalMs: 0, averageMs: 0 });
  });

  it("summarizes a single completed shift", () => {
    const summary = summarizeShiftHistory([
      shift("2026-11-06T07:00:00.000Z", "2026-11-06T15:00:00.000Z"),
    ]);
    expect(summary).toEqual({ shiftCount: 1, totalMs: 8 * HOUR, averageMs: 8 * HOUR });
  });

  it("sums several shifts and averages over their count", () => {
    const summary = summarizeShiftHistory([
      shift("2026-11-04T07:00:00.000Z", "2026-11-04T15:00:00.000Z"),
      shift("2026-11-05T07:00:00.000Z", "2026-11-05T11:00:00.000Z"),
      shift("2026-11-06T07:00:00.000Z", "2026-11-06T13:00:00.000Z"),
    ]);
    expect(summary.shiftCount).toBe(3);
    expect(summary.totalMs).toBe(18 * HOUR);
    expect(summary.averageMs).toBe(6 * HOUR);
  });

  it("ignores a shift that has not been clocked out", () => {
    const summary = summarizeShiftHistory([
      shift("2026-11-06T07:00:00.000Z", "2026-11-06T15:00:00.000Z"),
      shift("2026-11-07T07:00:00.000Z", null),
    ]);
    expect(summary).toEqual({ shiftCount: 1, totalMs: 8 * HOUR, averageMs: 8 * HOUR });
  });

  it("counts a shift that ends before it starts as zero rather than negative", () => {
    const summary = summarizeShiftHistory([
      shift("2026-11-06T07:00:00.000Z", "2026-11-06T15:00:00.000Z"),
      shift("2026-11-07T15:00:00.000Z", "2026-11-07T07:00:00.000Z"),
    ]);
    expect(summary.shiftCount).toBe(2);
    expect(summary.totalMs).toBe(8 * HOUR);
    expect(summary.averageMs).toBe(4 * HOUR);
  });
});
