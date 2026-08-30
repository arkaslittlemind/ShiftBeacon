import { requireApiUser } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { getAnalyticsForOrganization } from "@/lib/services/analytics-service";

export async function GET() {
  const result = await requireApiUser({ role: "MANAGER" });
  if (!result.ok) {
    return result.response;
  }

  const analytics = await getAnalyticsForOrganization(result.user.organizationId);
  return apiSuccess(analytics);
}
