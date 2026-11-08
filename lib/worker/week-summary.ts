import { toUtcDateKey, windowDateKeys } from "@/lib/services/analytics-service";
import { MS_PER_HOUR } from "@/lib/time";

type CompletedShift = { clockInAt: Date; clockOutAt: Date | null };

export type WeekDay = {
  dateKey: string;
  weekday: string;
  hours: number;
  worked: boolean;
  isToday: boolean;
};

export type WeekSummary = {
  totalHours: number;
  shiftCount: number;
  days: WeekDay[];
};

const weekdayFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" });

/** The worker's rolling 7 UTC days, bucketed exactly like the manager charts.
 * An active shift marks today as worked but adds no hours until it ends. */
export function summarizeWeek(
  history: CompletedShift[],
  activeShift: { clockInAt: Date } | null,
  now: Date
): WeekSummary {
  const keys = windowDateKeys(now);
  const hoursByDay = new Map(keys.map((key) => [key, 0]));
  const workedDays = new Set<string>();
  let shiftCount = 0;

  for (const shift of history) {
    const key = toUtcDateKey(shift.clockInAt);
    if (!shift.clockOutAt || !hoursByDay.has(key)) continue;
    const hours = (shift.clockOutAt.getTime() - shift.clockInAt.getTime()) / MS_PER_HOUR;
    hoursByDay.set(key, (hoursByDay.get(key) ?? 0) + hours);
    workedDays.add(key);
    shiftCount += 1;
  }

  if (activeShift && hoursByDay.has(toUtcDateKey(activeShift.clockInAt))) {
    workedDays.add(toUtcDateKey(activeShift.clockInAt));
  }

  const todayKey = toUtcDateKey(now);
  const days = keys.map((dateKey) => ({
    dateKey,
    weekday: weekdayFormatter.format(new Date(`${dateKey}T00:00:00Z`)),
    hours: hoursByDay.get(dateKey) ?? 0,
    worked: workedDays.has(dateKey),
    isToday: dateKey === todayKey,
  }));

  return {
    totalHours: days.reduce((sum, day) => sum + day.hours, 0),
    shiftCount,
    days,
  };
}
