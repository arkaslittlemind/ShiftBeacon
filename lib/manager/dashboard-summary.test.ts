import { describe, expect, it } from "vitest";
import { sortStaffForTable, staffHoursBars, summarizeDashboard } from "./dashboard-summary";
import type { AnalyticsResponse } from "@/types/analytics";
import type { StaffMemberResponse } from "@/types/staff";

function member(
  id: string,
  name: string,
  clockInAt: string | null = null
): StaffMemberResponse {
  return {
    id,
    name,
    email: `${id}@example.com`,
    role: "CARE_WORKER",
    status: clockInAt ? "CLOCKED_IN" : "CLOCKED_OUT",
    activeShift: clockInAt
      ? { clockInAt, clockInLatitude: 51.5, clockInLongitude: -0.12 }
      : null,
  };
}

function analytics(counts: number[], averageHoursPerDay = 0): AnalyticsResponse {
  return {
    windowDays: 7,
    averageHoursPerDay,
    dailyClockIns: counts.map((count, index) => ({
      date: `2026-11-0${index + 1}`,
      count,
    })),
    staffHours: [],
  };
}

const WEEK = [1, 2, 3, 4, 5, 13, 16];

describe("summarizeDashboard", () => {
  it("says no staff have joined when the organization is empty", () => {
    const summary = summarizeDashboard([], analytics([0, 0, 0, 0, 0, 0, 0]));
    expect(summary).toMatchObject({ onShift: 0, total: 0 });
    expect(summary.statusLine).toBe("No staff have joined yet.");
  });

  it("says nobody is on shift when every member is clocked out", () => {
    const summary = summarizeDashboard([member("a", "Ada"), member("b", "Bo")], analytics(WEEK));
    expect(summary.onShift).toBe(0);
    expect(summary.statusLine).toBe("No one is on shift right now.");
  });

  it("uses the singular for one person on shift", () => {
    const staff = [member("a", "Ada", "2026-11-07T06:00:00.000Z"), member("b", "Bo")];
    expect(summarizeDashboard(staff, analytics(WEEK)).statusLine).toBe(
      "1 of 2 staff is on shift."
    );
  });

  it("uses the plural for several people on shift", () => {
    const staff = [
      member("a", "Ada", "2026-11-07T06:00:00.000Z"),
      member("b", "Bo", "2026-11-07T07:00:00.000Z"),
      member("c", "Cy"),
    ];
    expect(summarizeDashboard(staff, analytics(WEEK)).statusLine).toBe(
      "2 of 3 staff are on shift."
    );
  });

  it("says all staff are on shift when nobody is off", () => {
    const staff = [
      member("a", "Ada", "2026-11-07T06:00:00.000Z"),
      member("b", "Bo", "2026-11-07T07:00:00.000Z"),
    ];
    expect(summarizeDashboard(staff, analytics(WEEK)).statusLine).toBe(
      "All 2 staff are on shift."
    );
  });

  it("reads today and yesterday from the end of the daily window", () => {
    const summary = summarizeDashboard([], analytics(WEEK));
    expect(summary.clockInsToday).toBe(16);
    expect(summary.clockInsYesterday).toBe(13);
  });

  it("derives hours logged from the daily average over the window", () => {
    const summary = summarizeDashboard([], analytics(WEEK, 7.5));
    expect(summary.averageHoursPerDay).toBe(7.5);
    expect(summary.hoursLogged).toBe(52.5);
  });
});

describe("sortStaffForTable", () => {
  it("puts on-shift staff first by earliest clock-in, then off-shift staff by name", () => {
    const staff = [
      member("z", "Zed"),
      member("late", "Late", "2026-11-07T09:00:00.000Z"),
      member("a", "Amy"),
      member("early", "Early", "2026-11-07T06:00:00.000Z"),
    ];
    expect(sortStaffForTable(staff).map((m) => m.id)).toEqual(["early", "late", "a", "z"]);
  });

  it("keeps a stable order for equal clock-in times by name", () => {
    const staff = [
      member("b", "Bo", "2026-11-07T06:00:00.000Z"),
      member("a", "Ada", "2026-11-07T06:00:00.000Z"),
    ];
    expect(sortStaffForTable(staff).map((m) => m.id)).toEqual(["a", "b"]);
  });

  it("does not mutate its input", () => {
    const staff = [member("z", "Zed"), member("a", "Amy")];
    sortStaffForTable(staff);
    expect(staff.map((m) => m.id)).toEqual(["z", "a"]);
  });
});

describe("staffHoursBars", () => {
  it("sorts by hours, most first, with fractions relative to the top value", () => {
    const bars = staffHoursBars([
      { userId: "a", name: "Ada", totalHours: 10 },
      { userId: "b", name: "Bo", totalHours: 40 },
      { userId: "c", name: "Cy", totalHours: 20 },
    ]);
    expect(bars.map((bar) => [bar.userId, bar.fraction])).toEqual([
      ["b", 1],
      ["c", 0.5],
      ["a", 0.25],
    ]);
  });

  it("breaks ties by name", () => {
    const bars = staffHoursBars([
      { userId: "b", name: "Bo", totalHours: 5 },
      { userId: "a", name: "Ada", totalHours: 5 },
    ]);
    expect(bars.map((bar) => bar.userId)).toEqual(["a", "b"]);
  });

  it("gives every bar a zero fraction when nobody has logged hours", () => {
    const bars = staffHoursBars([
      { userId: "a", name: "Ada", totalHours: 0 },
      { userId: "b", name: "Bo", totalHours: 0 },
    ]);
    expect(bars.every((bar) => bar.fraction === 0)).toBe(true);
  });

  it("gives a single member a full bar", () => {
    expect(staffHoursBars([{ userId: "a", name: "Ada", totalHours: 3 }])[0].fraction).toBe(1);
  });

  it("returns an empty list for no staff", () => {
    expect(staffHoursBars([])).toEqual([]);
  });
});
