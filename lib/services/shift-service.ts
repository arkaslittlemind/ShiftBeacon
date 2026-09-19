import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { haversineDistanceMeters } from "@/lib/geo";
import type { ClockInInput, ClockOutInput, ShiftResponse } from "@/types/shift";

const ACTIVE_SHIFT_UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

const HISTORY_LIMIT = 50;

export function toShiftResponse(shift: {
  id: string;
  clockInAt: Date;
  clockInLatitude: number;
  clockInLongitude: number;
  clockInNote: string | null;
  clockOutAt: Date | null;
  clockOutLatitude: number | null;
  clockOutLongitude: number | null;
  clockOutNote: string | null;
}): ShiftResponse {
  return {
    id: shift.id,
    clockInAt: shift.clockInAt.toISOString(),
    clockInLatitude: shift.clockInLatitude,
    clockInLongitude: shift.clockInLongitude,
    clockInNote: shift.clockInNote,
    clockOutAt: shift.clockOutAt ? shift.clockOutAt.toISOString() : null,
    clockOutLatitude: shift.clockOutLatitude,
    clockOutLongitude: shift.clockOutLongitude,
    clockOutNote: shift.clockOutNote,
  };
}

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

export class NoActiveShiftError extends Error {
  constructor() {
    super("You don't have an active shift to clock out of.");
    this.name = "NoActiveShiftError";
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

  try {
    return await prisma.shift.create({
      data: {
        userId,
        organizationId,
        clockInAt: new Date(),
        clockInLatitude: input.latitude,
        clockInLongitude: input.longitude,
        clockInNote: input.note,
      },
    });
  } catch (error) {
    // A concurrent request can pass the findFirst check above before either
    // has written a row; the partial unique index then rejects the loser at
    // the DB layer instead of the pre-check, so surface the same friendly error.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === ACTIVE_SHIFT_UNIQUE_CONSTRAINT_ERROR_CODE
    ) {
      throw new ActiveShiftExistsError();
    }
    throw error;
  }
}

export async function clockOut(userId: string, input: ClockOutInput) {
  const activeShift = await prisma.shift.findFirst({
    where: { userId, clockOutAt: null },
  });

  if (!activeShift) {
    throw new NoActiveShiftError();
  }

  // Matching on clockOutAt: null makes this a compare-and-swap: of two
  // concurrent clock-outs only one matches a row, and the loser must not
  // overwrite the winner's time, coordinates or note.
  const { count } = await prisma.shift.updateMany({
    where: { id: activeShift.id, clockOutAt: null },
    data: {
      clockOutAt: new Date(),
      clockOutLatitude: input.latitude,
      clockOutLongitude: input.longitude,
      clockOutNote: input.note,
    },
  });

  if (count === 0) {
    throw new NoActiveShiftError();
  }

  return prisma.shift.findUniqueOrThrow({ where: { id: activeShift.id } });
}
