import { after } from "next/server";
import { requireApiUser } from "@/lib/api/auth";
import { withRouteHandler } from "@/lib/api/handler";
import { captureServerEvent } from "@/lib/observability/events";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validate";
import { updateOrganization } from "@/lib/services/organization-service";
import { updateOrganizationSchema } from "@/lib/validation/organization";
import type { OrganizationResponse } from "@/types/organization";

function toOrganizationResponse(organization: {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  clockInRadiusMeters: number;
}): OrganizationResponse {
  return {
    id: organization.id,
    name: organization.name,
    latitude: organization.latitude,
    longitude: organization.longitude,
    clockInRadiusMeters: organization.clockInRadiusMeters,
  };
}

export const GET = withRouteHandler("GET /api/organizations/me", async () => {
  const result = await requireApiUser();
  if (!result.ok) {
    return result.response;
  }

  return apiSuccess(toOrganizationResponse(result.user.organization));
});

export const PATCH = withRouteHandler(
  "PATCH /api/organizations/me",
  async (request: Request) => {
    const result = await requireApiUser({ role: "MANAGER" });
    if (!result.ok) {
      return result.response;
    }

    const parsed = await parseJsonBody(request, updateOrganizationSchema);
    if (!parsed.ok) {
      return parsed.response;
    }

    const before = result.user.organization;
    const organization = await updateOrganization(
      result.user.organizationId,
      parsed.data
    );

    // Which fields moved, never what they moved to: the new latitude and
    // longitude are exactly what must not reach the analytics vendor.
    after(() =>
      captureServerEvent(result.user, {
        name: "workplace_configuration_updated",
        changedName: organization.name !== before.name,
        changedLocation:
          organization.latitude !== before.latitude ||
          organization.longitude !== before.longitude,
        changedRadius:
          organization.clockInRadiusMeters !== before.clockInRadiusMeters,
      })
    );
    return apiSuccess(toOrganizationResponse(organization));
  }
);
