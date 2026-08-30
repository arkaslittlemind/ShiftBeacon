import { prisma } from "@/lib/prisma";
import type { AnalyticsResponse } from "@/types/analytics";

const WINDOW_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type ShiftInput = {
  userId: string;
  clockInAt: Date;
  clockOutAt: Date | null;
};

type StaffInput = {
  id: string;
  name: string;
};

function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function windowDateKeys(now: Date): string[] {
  const keys: string[] = [];
  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    keys.push(toUtcDateKey(new Date(now.getTime() - i * MS_PER_DAY)));
  }
  return keys;
}

function durationHours(shift: ShiftInput): number {
  if (!shift.clockOutAt) {
    return 0;
  }
  return (shift.clockOutAt.getTime() - shift.clockInAt.getTime()) / (60 * 60 * 1000);
}

export function computeAnalytics(
  shifts: ShiftInput[],
  staff: StaffInput[],
  now: Date
): AnalyticsResponse {
  const dateKeys = windowDateKeys(now);
  const dateKeySet = new Set(dateKeys);

  const inWindow = shifts.filter((shift) => dateKeySet.has(toUtcDateKey(shift.clockInAt)));
  const completedInWindow = inWindow.filter((shift) => shift.clockOutAt !== null);

  const clockInsByDate = new Map(dateKeys.map((key) => [key, 0]));
  for (const shift of inWindow) {
    const key = toUtcDateKey(shift.clockInAt);
    clockInsByDate.set(key, (clockInsByDate.get(key) ?? 0) + 1);
  }

  const hoursByUserId = new Map<string, number>();
  for (const shift of completedInWindow) {
    hoursByUserId.set(shift.userId, (hoursByUserId.get(shift.userId) ?? 0) + durationHours(shift));
  }

  const totalHours = completedInWindow.reduce((sum, shift) => sum + durationHours(shift), 0);

  return {
    windowDays: WINDOW_DAYS,
    averageHoursPerDay: totalHours / WINDOW_DAYS,
    dailyClockIns: dateKeys.map((date) => ({ date, count: clockInsByDate.get(date) ?? 0 })),
    staffHours: staff.map((member) => ({
      userId: member.id,
      name: member.name,
      totalHours: hoursByUserId.get(member.id) ?? 0,
    })),
  };
}

export async function getAnalyticsForOrganization(
  organizationId: string
): Promise<AnalyticsResponse> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - (WINDOW_DAYS - 1) * MS_PER_DAY);
  windowStart.setUTCHours(0, 0, 0, 0);

  const [shifts, staff] = await Promise.all([
    prisma.shift.findMany({
      where: { organizationId, clockInAt: { gte: windowStart } },
      select: { userId: true, clockInAt: true, clockOutAt: true },
    }),
    prisma.user.findMany({
      where: { organizationId },
      select: { id: true, name: true },
    }),
  ]);

  return computeAnalytics(shifts, staff, now);
}
