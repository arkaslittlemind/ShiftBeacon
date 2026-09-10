import { requireApiUser } from "@/lib/api/auth";
import { withRouteHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { getAnalyticsForOrganization } from "@/lib/services/analytics-service";

export const GET = withRouteHandler("GET /api/manager/analytics", async () => {
  const result = await requireApiUser({ role: "MANAGER" });
  if (!result.ok) {
    return result.response;
  }

  const analytics = await getAnalyticsForOrganization(result.user.organizationId);
  return apiSuccess(analytics);
});
