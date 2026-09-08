import { prisma } from "@/lib/prisma";
import type { StaffMemberResponse } from "@/types/staff";
import type { Role } from "@/types/user";

const HISTORY_LIMIT = 50;

export async function getStaffForOrganization(organizationId: string) {
  return prisma.user.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    include: {
      shifts: {
        where: { clockOutAt: null },
        take: 1,
      },
    },
  });
}

export async function getShiftHistoryForStaffMember(
  organizationId: string,
  staffUserId: string
) {
  const staff = await prisma.user.findFirst({
    where: { id: staffUserId, organizationId },
  });
  if (!staff) {
    return null;
  }

  const [activeShift, history] = await Promise.all([
    prisma.shift.findFirst({
      where: { userId: staffUserId, clockOutAt: null },
    }),
    prisma.shift.findMany({
      where: { userId: staffUserId, clockOutAt: { not: null } },
      orderBy: { clockInAt: "desc" },
      take: HISTORY_LIMIT,
    }),
  ]);

  return { staff, activeShift, history };
}

export function toStaffMemberResponse(user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  shifts: {
    clockInAt: Date;
    clockInLatitude: number;
    clockInLongitude: number;
  }[];
}): StaffMemberResponse {
  const activeShift = user.shifts[0] ?? null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: activeShift ? "CLOCKED_IN" : "CLOCKED_OUT",
    activeShift: activeShift
      ? {
          clockInAt: activeShift.clockInAt.toISOString(),
          clockInLatitude: activeShift.clockInLatitude,
          clockInLongitude: activeShift.clockInLongitude,
        }
      : null,
  };
}
