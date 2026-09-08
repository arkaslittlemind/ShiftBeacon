import { requireApiUser } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { getStaffForOrganization, toStaffMemberResponse } from "@/lib/services/staff-service";

export async function GET() {
  const result = await requireApiUser({ role: "MANAGER" });
  if (!result.ok) {
    return result.response;
  }

  const staff = await getStaffForOrganization(result.user.organizationId);
  return apiSuccess(staff.map(toStaffMemberResponse));
}
