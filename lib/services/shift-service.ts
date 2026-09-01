import { prisma } from "@/lib/prisma";
import { haversineDistanceMeters } from "@/lib/geo";
import type { ClockInInput } from "@/types/shift";

const HISTORY_LIMIT = 50;

export class ActiveShiftExistsError extends Error {
  constructor() {
    super("You already have an active shift.");
    this.name = "ActiveShiftExistsError";
  }
}

export class OutsidePerimeterError extends Error {
  constructor() {
    super("You're outside the workplace clock-in perimeter.");
    this.name = "OutsidePerimeterError";
  }
}

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

export async function clockIn(
  userId: string,
  organizationId: string,
  input: ClockInInput
) {
  const [existingActiveShift, organization] = await Promise.all([
    prisma.shift.findFirst({ where: { userId, clockOutAt: null } }),
    prisma.organization.findUniqueOrThrow({ where: { id: organizationId } }),
  ]);

  if (existingActiveShift) {
    throw new ActiveShiftExistsError();
  }

  const distanceMeters = haversineDistanceMeters(
    input.latitude,
    input.longitude,
    organization.latitude,
    organization.longitude
  );
  if (distanceMeters > organization.clockInRadiusMeters) {
    throw new OutsidePerimeterError();
  }

  return prisma.shift.create({
    data: {
      userId,
      organizationId,
      clockInAt: new Date(),
      clockInLatitude: input.latitude,
      clockInLongitude: input.longitude,
      clockInNote: input.note,
    },
  });
}
