import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Organization, User } from "@/lib/generated/prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    organization: { findFirst: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { OrgNotConfiguredError, findOrCreateCurrentUser } from "./user-service";

const mockedFindUser = vi.mocked(prisma.user.findUnique);
const mockedCreateUser = vi.mocked(prisma.user.create);
const mockedFindOrg = vi.mocked(prisma.organization.findFirst);

const organization = {
  id: "org1",
  name: "Riverside Care Home",
  latitude: 51.5074,
  longitude: -0.1278,
  clockInRadiusMeters: 200,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies Organization;

const claims = { name: "Casey Worker", email: "casey@example.com", role: "CARE_WORKER" } as const;

const existingUser = {
  id: "u1",
  auth0UserId: "auth0|abc",
  name: "Casey Worker",
  email: "casey@example.com",
  role: "CARE_WORKER",
  organizationId: organization.id,
  createdAt: new Date(),
  updatedAt: new Date(),
  organization,
} satisfies User & { organization: Organization };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("findOrCreateCurrentUser", () => {
  it("returns the existing user without touching the organization or creating a row", async () => {
    mockedFindUser.mockResolvedValue(existingUser);

    const result = await findOrCreateCurrentUser("auth0|abc", claims);

    expect(result).toBe(existingUser);
    expect(mockedFindOrg).not.toHaveBeenCalled();
    expect(mockedCreateUser).not.toHaveBeenCalled();
  });

  it("does not overwrite an existing user's role from the session claims", async () => {
    mockedFindUser.mockResolvedValue(existingUser);

    const result = await findOrCreateCurrentUser("auth0|abc", { ...claims, role: "MANAGER" });

    expect(result.role).toBe("CARE_WORKER");
    expect(mockedCreateUser).not.toHaveBeenCalled();
  });

  it("creates a new user attached to the configured organization", async () => {
    mockedFindUser.mockResolvedValue(null);
    mockedFindOrg.mockResolvedValue(organization);
    mockedCreateUser.mockResolvedValue(existingUser);

    const result = await findOrCreateCurrentUser("auth0|abc", claims);

    expect(mockedCreateUser).toHaveBeenCalledWith({
      data: {
        auth0UserId: "auth0|abc",
        name: claims.name,
        email: claims.email,
        role: "CARE_WORKER",
        organizationId: organization.id,
      },
      include: { organization: true },
    });
    expect(result).toBe(existingUser);
  });

  it("picks the oldest organization so assignment is deterministic", async () => {
    mockedFindUser.mockResolvedValue(null);
    mockedFindOrg.mockResolvedValue(organization);
    mockedCreateUser.mockResolvedValue(existingUser);

    await findOrCreateCurrentUser("auth0|abc", claims);

    expect(mockedFindOrg).toHaveBeenCalledWith({ orderBy: { createdAt: "asc" } });
  });

  it("throws OrgNotConfiguredError when no organization exists", async () => {
    mockedFindUser.mockResolvedValue(null);
    mockedFindOrg.mockResolvedValue(null);

    await expect(findOrCreateCurrentUser("auth0|abc", claims)).rejects.toThrow(
      OrgNotConfiguredError
    );
    expect(mockedCreateUser).not.toHaveBeenCalled();
  });
});
