import { prisma } from "@/lib/prisma";

type UpdateOrganizationData = Partial<{
  name: string;
  latitude: number;
  longitude: number;
  clockInRadiusMeters: number;
}>;

export async function updateOrganization(id: string, data: UpdateOrganizationData) {
  return prisma.organization.update({ where: { id }, data });
}
