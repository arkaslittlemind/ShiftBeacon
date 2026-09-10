import { requireApiUser } from "@/lib/api/auth";
import { withRouteHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { getStaffForOrganization, toStaffMemberResponse } from "@/lib/services/staff-service";

export const GET = withRouteHandler("GET /api/manager/staff", async () => {
  const result = await requireApiUser({ role: "MANAGER" });
  if (!result.ok) {
    return result.response;
  }

  const staff = await getStaffForOrganization(result.user.organizationId);
  return apiSuccess(staff.map(toStaffMemberResponse));
});
