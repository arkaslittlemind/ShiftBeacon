import { describe, expect, it } from "vitest";
import { summarizeWeek } from "./week-summary";

// Window is the 7 UTC days ending on `now`: Thu 2024-01-04 .. Wed 2024-01-10.
const now = new Date("2024-01-10T12:00:00Z");

function shift(clockIn: string, clockOut: string) {
  return { clockInAt: new Date(clockIn), clockOutAt: new Date(clockOut) };
}

describe("summarizeWeek", () => {
  it("returns seven off days, oldest first, when there are no shifts", () => {
    const summary = summarizeWeek([], null, now);

    expect(summary.totalHours).toBe(0);
    expect(summary.shiftCount).toBe(0);
    expect(summary.days.map((day) => day.dateKey)).toEqual([
      "2024-01-04",
      "2024-01-05",
      "2024-01-06",
      "2024-01-07",
      "2024-01-08",
      "2024-01-09",
      "2024-01-10",
    ]);
    expect(summary.days.map((day) => day.weekday)).toEqual([
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
    ]);
    expect(summary.days.every((day) => !day.worked && day.hours === 0)).toBe(true);
    expect(summary.days.map((day) => day.isToday)).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ]);
  });

  it("counts a completed shift today", () => {
    const summary = summarizeWeek([shift("2024-01-10T06:00:00Z", "2024-01-10T08:30:00Z")], null, now);

    expect(summary.totalHours).toBe(2.5);
    expect(summary.shiftCount).toBe(1);
    expect(summary.days[6]).toMatchObject({ worked: true, hours: 2.5, isToday: true });
  });

  it("marks today worked for an active shift without adding it to the hours", () => {
    const summary = summarizeWeek([], { clockInAt: new Date("2024-01-10T07:00:00Z") }, now);

    expect(summary.totalHours).toBe(0);
    expect(summary.shiftCount).toBe(0);
    expect(summary.days[6]).toMatchObject({ worked: true, hours: 0 });
  });

  it("ignores a shift that clocked in the day before the window", () => {
    const summary = summarizeWeek([shift("2024-01-03T22:00:00Z", "2024-01-04T06:00:00Z")], null, now);

    expect(summary.totalHours).toBe(0);
    expect(summary.shiftCount).toBe(0);
    expect(summary.days.some((day) => day.worked)).toBe(false);
  });

  it("adds two shifts on the same day into one block", () => {
    const summary = summarizeWeek(
      [
        shift("2024-01-08T06:00:00Z", "2024-01-08T10:00:00Z"),
        shift("2024-01-08T14:00:00Z", "2024-01-08T17:00:00Z"),
      ],
      null,
      now
    );

    expect(summary.totalHours).toBe(7);
    expect(summary.shiftCount).toBe(2);
    expect(summary.days[4]).toMatchObject({ dateKey: "2024-01-08", worked: true, hours: 7 });
  });
});
