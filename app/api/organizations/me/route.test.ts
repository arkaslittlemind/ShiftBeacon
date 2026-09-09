import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiError } from "@/lib/api/response";
import type { Organization } from "@/lib/generated/prisma/client";

vi.mock("@/lib/api/auth", () => ({
  requireApiUser: vi.fn(),
}));

vi.mock("@/lib/services/organization-service", () => ({
  updateOrganization: vi.fn(),
}));

import { requireApiUser } from "@/lib/api/auth";
import { updateOrganization } from "@/lib/services/organization-service";
import type { UserWithOrganization } from "@/lib/services/user-service";
import { PATCH } from "./route";

const mockedRequireApiUser = vi.mocked(requireApiUser);
const mockedUpdateOrganization = vi.mocked(updateOrganization);

const managerUser = {
  id: "manager1",
  organizationId: "org1",
} as unknown as UserWithOrganization;

const updatedOrganization = {
  id: "org1",
  name: "Riverside Care Home",
  latitude: 51.5074,
  longitude: -0.1278,
  clockInRadiusMeters: 300,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies Organization;

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/organizations/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PATCH /api/organizations/me", () => {
  it("requests the MANAGER role", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: managerUser });
    mockedUpdateOrganization.mockResolvedValue(updatedOrganization);

    await PATCH(buildRequest({ clockInRadiusMeters: 300 }));

    expect(mockedRequireApiUser).toHaveBeenCalledWith({ role: "MANAGER" });
  });

  it("returns the auth response directly when not authorized", async () => {
    mockedRequireApiUser.mockResolvedValue({
      ok: false,
      response: apiError(403, "Forbidden"),
    });

    const response = await PATCH(buildRequest({ clockInRadiusMeters: 300 }));

    expect(response.status).toBe(403);
    expect(mockedUpdateOrganization).not.toHaveBeenCalled();
  });

  it("updates the authenticated user's organization, never a client-supplied id", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: managerUser });
    mockedUpdateOrganization.mockResolvedValue(updatedOrganization);

    await PATCH(buildRequest({ clockInRadiusMeters: 300 }));

    expect(mockedUpdateOrganization).toHaveBeenCalledWith("org1", { clockInRadiusMeters: 300 });
  });

  it("returns 400 without calling the service when the body is invalid", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: managerUser });

    const response = await PATCH(buildRequest({}));

    expect(response.status).toBe(400);
    expect(mockedUpdateOrganization).not.toHaveBeenCalled();
  });

  it("returns 200 with the updated organization on success", async () => {
    mockedRequireApiUser.mockResolvedValue({ ok: true, user: managerUser });
    mockedUpdateOrganization.mockResolvedValue(updatedOrganization);

    const response = await PATCH(buildRequest({ clockInRadiusMeters: 300 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.clockInRadiusMeters).toBe(300);
  });
});
