import { prisma } from "@/lib/prisma";

const HISTORY_LIMIT = 50;

export async function getShiftsForUser(userId: string) {
  const [activeShift, history] = await Promise.all([
    prisma.shift.findFirst({
      where: { userId, clockOutAt: null },
    }),
    prisma.shift.findMany({
      where: { userId, clockOutAt: { not: null } },
      orderBy: { clockInAt: "desc" },
      take: HISTORY_LIMIT,
    }),
  ]);

  return { activeShift, history };
}
