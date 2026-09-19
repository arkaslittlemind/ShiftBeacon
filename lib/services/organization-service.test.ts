import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Organization } from "@/lib/generated/prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: { organization: { update: vi.fn() } },
}));

import { prisma } from "@/lib/prisma";
import { updateOrganization } from "./organization-service";

const mockedUpdate = vi.mocked(prisma.organization.update);

const updated = {
  id: "org1",
  name: "Riverside Care Home",
  latitude: 51.5074,
  longitude: -0.1278,
  clockInRadiusMeters: 300,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies Organization;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateOrganization", () => {
  it("scopes the update to the authenticated user's organization", async () => {
    mockedUpdate.mockResolvedValue(updated);

    const result = await updateOrganization(
      { organizationId: "org1" },
      { clockInRadiusMeters: 300 }
    );

    expect(mockedUpdate).toHaveBeenCalledWith({
      where: { id: "org1" },
      data: { clockInRadiusMeters: 300 },
    });
    expect(result).toBe(updated);
  });

  it("never targets an organization other than the user's own", async () => {
    mockedUpdate.mockResolvedValue(updated);

    await updateOrganization({ organizationId: "org-mine" }, { name: "Renamed" });

    expect(mockedUpdate).toHaveBeenCalledOnce();
    expect(mockedUpdate.mock.calls[0][0].where).toEqual({ id: "org-mine" });
  });
});
