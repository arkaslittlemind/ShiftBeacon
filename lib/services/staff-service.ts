import { prisma } from "@/lib/prisma";

export async function getStaffForOrganization(organizationId: string) {
  return prisma.user.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    include: {
      shifts: {
        where: { clockOutAt: null },
        take: 1,
      },
    },
  });
}
