import { prisma } from "@/lib/prisma";
import type { User } from "@/lib/generated/prisma/client";

type UpdateOrganizationData = Partial<{
  name: string;
  latitude: number;
  longitude: number;
  clockInRadiusMeters: number;
}>;

// Takes the authenticated user, not an id string, so a client-supplied
// organization id can't be passed through by accident.
export async function updateOrganization(
  user: Pick<User, "organizationId">,
  data: UpdateOrganizationData
) {
  return prisma.organization.update({ where: { id: user.organizationId }, data });
}
