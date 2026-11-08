import type { AnalyticsResponse } from "@/types/analytics";
import type { StaffMemberResponse } from "@/types/staff";

export type DashboardSummary = {
  onShift: number;
  total: number;
  clockInsToday: number;
  clockInsYesterday: number;
  averageHoursPerDay: number;
  hoursLogged: number;
  statusLine: string;
};

export type StaffHoursBar = AnalyticsResponse["staffHours"][number] & { fraction: number };

function statusLine(onShift: number, total: number): string {
  if (total === 0) return "No staff have joined yet.";
  if (onShift === 0) return "No one is on shift right now.";
  if (onShift === total) return `All ${total} staff are on shift.`;
  return `${onShift} of ${total} staff ${onShift === 1 ? "is" : "are"} on shift.`;
}

/** Every value comes from data the dashboard already loads; nothing new is queried. */
export function summarizeDashboard(
  staff: StaffMemberResponse[],
  analytics: AnalyticsResponse
): DashboardSummary {
  const onShift = staff.filter((member) => member.activeShift !== null).length;
  // dailyClockIns is oldest first, so today is the last entry.
  const days = analytics.dailyClockIns;

  return {
    onShift,
    total: staff.length,
    clockInsToday: days.at(-1)?.count ?? 0,
    clockInsYesterday: days.at(-2)?.count ?? 0,
    averageHoursPerDay: analytics.averageHoursPerDay,
    hoursLogged: analytics.averageHoursPerDay * analytics.windowDays,
    statusLine: statusLine(onShift, staff.length),
  };
}

/** On shift first (earliest clock-in first), then off shift by name. */
export function sortStaffForTable(staff: StaffMemberResponse[]): StaffMemberResponse[] {
  return [...staff].sort((a, b) => {
    if (a.activeShift && b.activeShift) {
      const byClockIn =
        Date.parse(a.activeShift.clockInAt) - Date.parse(b.activeShift.clockInAt);
      if (byClockIn !== 0) return byClockIn;
    } else if (a.activeShift || b.activeShift) {
      return a.activeShift ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

export function staffHoursBars(staffHours: AnalyticsResponse["staffHours"]): StaffHoursBar[] {
  const top = Math.max(0, ...staffHours.map((member) => member.totalHours));
  return [...staffHours]
    .sort((a, b) => b.totalHours - a.totalHours || a.name.localeCompare(b.name))
    .map((member) => ({ ...member, fraction: top > 0 ? member.totalHours / top : 0 }));
}
