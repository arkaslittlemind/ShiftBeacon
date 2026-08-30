import { prisma } from "@/lib/prisma";
import type { Organization, User } from "@/lib/generated/prisma/client";
import type { Role } from "@/types/user";

export class OrgNotConfiguredError extends Error {
  constructor() {
    super("No organization is configured for this deployment yet.");
    this.name = "OrgNotConfiguredError";
  }
}

export type UserWithOrganization = User & { organization: Organization };

type NewUserClaims = {
  name: string;
  email: string;
  role: Role;
};

export async function findOrCreateCurrentUser(
  auth0UserId: string,
  claims: NewUserClaims
): Promise<UserWithOrganization> {
  const existing = await prisma.user.findUnique({
    where: { auth0UserId },
    include: { organization: true },
  });

  if (existing) {
    return existing;
  }

  const organization = await prisma.organization.findFirst();
  if (!organization) {
    throw new OrgNotConfiguredError();
  }

  return prisma.user.create({
    data: {
      auth0UserId,
      name: claims.name,
      email: claims.email,
      role: claims.role,
      organizationId: organization.id,
    },
    include: { organization: true },
  });
}
