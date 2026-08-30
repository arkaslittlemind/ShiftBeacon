import { requireApiUser } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { getStaffForOrganization } from "@/lib/services/staff-service";
import type { Role } from "@/types/user";
import type { StaffMemberResponse } from "@/types/staff";

function toStaffMemberResponse(user: {
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

export async function GET() {
  const result = await requireApiUser({ role: "MANAGER" });
  if (!result.ok) {
    return result.response;
  }

  const staff = await getStaffForOrganization(result.user.organizationId);
  return apiSuccess(staff.map(toStaffMemberResponse));
}
