import { z } from "zod";
import { requireApiUser } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validate";
import { updateOrganization } from "@/lib/services/organization-service";
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

export async function GET() {
  const result = await requireApiUser();
  if (!result.ok) {
    return result.response;
  }

  return apiSuccess(toOrganizationResponse(result.user.organization));
}

const updateOrganizationSchema = z
  .object({
    name: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    clockInRadiusMeters: z.number().int().positive(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export async function PATCH(request: Request) {
  const result = await requireApiUser({ role: "MANAGER" });
  if (!result.ok) {
    return result.response;
  }

  const parsed = await parseJsonBody(request, updateOrganizationSchema);
  if (!parsed.ok) {
    return parsed.response;
  }

  const organization = await updateOrganization(
    result.user.organizationId,
    parsed.data
  );
  return apiSuccess(toOrganizationResponse(organization));
}
