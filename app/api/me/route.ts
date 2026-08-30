import { requireApiUser } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import type { MeResponse } from "@/types/me";

export async function GET() {
  const result = await requireApiUser();
  if (!result.ok) {
    return result.response;
  }

  const { user } = result;
  const response: MeResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organization: {
      id: user.organization.id,
      name: user.organization.name,
      latitude: user.organization.latitude,
      longitude: user.organization.longitude,
      clockInRadiusMeters: user.organization.clockInRadiusMeters,
    },
  };

  return apiSuccess(response);
}
