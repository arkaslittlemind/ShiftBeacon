import { describe, expect, it } from "vitest";
import { computeAnalytics } from "./analytics-service";

// Window is the 7 UTC calendar days ending on `now`'s date: 2024-01-04..2024-01-10.
const now = new Date("2024-01-10T12:00:00Z");
const windowDates = [
  "2024-01-04",
  "2024-01-05",
  "2024-01-06",
  "2024-01-07",
  "2024-01-08",
  "2024-01-09",
  "2024-01-10",
];

function countsFor(dailyClockIns: { date: string; count: number }[], date: string) {
  return dailyClockIns.find((d) => d.date === date)?.count;
}

describe("computeAnalytics", () => {
  it("returns zeroed output when there are no shifts", () => {
    const result = computeAnalytics([], [{ id: "u1", name: "Casey" }], now);

    expect(result.windowDays).toBe(7);
    expect(result.averageHoursPerDay).toBe(0);
    expect(result.dailyClockIns.map((d) => d.date)).toEqual(windowDates);
    expect(result.dailyClockIns.every((d) => d.count === 0)).toBe(true);
    expect(result.staffHours).toEqual([{ userId: "u1", name: "Casey", totalHours: 0 }]);
  });

  it("excludes a shift whose clock-in falls outside the 7-day window", () => {
    const result = computeAnalytics(
      [
        {
          userId: "u1",
          clockInAt: new Date("2024-01-01T09:00:00Z"),
          clockOutAt: new Date("2024-01-01T17:00:00Z"),
        },
      ],
      [{ id: "u1", name: "Casey" }],
      now
    );

    expect(result.dailyClockIns.every((d) => d.count === 0)).toBe(true);
    expect(result.averageHoursPerDay).toBe(0);
    expect(result.staffHours[0].totalHours).toBe(0);
  });

  it("counts a completed shift inside the window for both clock-ins and hours", () => {
    const result = computeAnalytics(
      [
        {
          userId: "u1",
          clockInAt: new Date("2024-01-08T09:00:00Z"),
          clockOutAt: new Date("2024-01-08T17:00:00Z"),
        },
      ],
      [{ id: "u1", name: "Casey" }],
      now
    );

    expect(countsFor(result.dailyClockIns, "2024-01-08")).toBe(1);
    expect(result.staffHours[0].totalHours).toBe(8);
    expect(result.averageHoursPerDay).toBeCloseTo(8 / 7, 6);
  });

  it("counts an active (no clock-out) shift toward clock-ins but contributes zero hours", () => {
    const result = computeAnalytics(
      [
        {
          userId: "u1",
          clockInAt: new Date("2024-01-09T09:00:00Z"),
          clockOutAt: null,
        },
      ],
      [{ id: "u1", name: "Casey" }],
      now
    );

    expect(countsFor(result.dailyClockIns, "2024-01-09")).toBe(1);
    expect(result.staffHours[0].totalHours).toBe(0);
    expect(result.averageHoursPerDay).toBe(0);
  });

  it("combines a completed and an active shift correctly on the same run", () => {
    const result = computeAnalytics(
      [
        {
          userId: "u1",
          clockInAt: new Date("2024-01-08T09:00:00Z"),
          clockOutAt: new Date("2024-01-08T17:00:00Z"),
        },
        {
          userId: "u1",
          clockInAt: new Date("2024-01-09T09:00:00Z"),
          clockOutAt: null,
        },
      ],
      [{ id: "u1", name: "Casey" }],
      now
    );

    expect(countsFor(result.dailyClockIns, "2024-01-08")).toBe(1);
    expect(countsFor(result.dailyClockIns, "2024-01-09")).toBe(1);
    expect(result.staffHours[0].totalHours).toBe(8);
    expect(result.averageHoursPerDay).toBeCloseTo(8 / 7, 6);
  });
});
