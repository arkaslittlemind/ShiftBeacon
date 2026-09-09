import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionData } from "@auth0/nextjs-auth0/types";

vi.mock("@/lib/auth0", () => ({
  auth0: { getSession: vi.fn() },
}));

vi.mock("@/lib/services/user-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/services/user-service")>(
    "@/lib/services/user-service"
  );
  return { ...actual, findOrCreateCurrentUser: vi.fn() };
});

import { auth0 } from "@/lib/auth0";
import {
  findOrCreateCurrentUser,
  OrgNotConfiguredError,
  type UserWithOrganization,
} from "@/lib/services/user-service";
import { requireApiUser } from "./auth";

const mockedGetSession = vi.mocked(auth0.getSession);
const mockedFindOrCreate = vi.mocked(findOrCreateCurrentUser);

function buildSession(user: Partial<SessionData["user"]> = {}): SessionData {
  return {
    user: { sub: "auth0|care-worker-1", ...user },
    tokenSet: { accessToken: "token", expiresAt: 0 },
    internal: { sid: "sid-1", createdAt: 0 },
  };
}

const fakeUser = {
  id: "u1",
  organizationId: "org1",
} as unknown as UserWithOrganization;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireApiUser", () => {
  it("returns a 401 response when there is no session", async () => {
    mockedGetSession.mockResolvedValue(null);

    const result = await requireApiUser();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
    expect(mockedFindOrCreate).not.toHaveBeenCalled();
  });

  it("returns a 403 response when the session role doesn't match the required role", async () => {
    mockedGetSession.mockResolvedValue(
      buildSession({ "https://shiftbeacon.app/role": "CARE_WORKER" })
    );

    const result = await requireApiUser({ role: "MANAGER" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
    }
    expect(mockedFindOrCreate).not.toHaveBeenCalled();
  });

  it("returns a 500 response when no organization is configured", async () => {
    mockedGetSession.mockResolvedValue(buildSession());
    mockedFindOrCreate.mockRejectedValue(new OrgNotConfiguredError());

    const result = await requireApiUser();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(500);
    }
  });

  it("returns the resolved user when the role matches", async () => {
    mockedGetSession.mockResolvedValue(
      buildSession({
        name: "Casey",
        email: "casey@example.com",
        "https://shiftbeacon.app/role": "CARE_WORKER",
      })
    );
    mockedFindOrCreate.mockResolvedValue(fakeUser);

    const result = await requireApiUser({ role: "CARE_WORKER" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user).toBe(fakeUser);
    }
    expect(mockedFindOrCreate).toHaveBeenCalledWith("auth0|care-worker-1", {
      name: "Casey",
      email: "casey@example.com",
      role: "CARE_WORKER",
    });
  });

  it("returns the resolved user when no role is required", async () => {
    mockedGetSession.mockResolvedValue(buildSession());
    mockedFindOrCreate.mockResolvedValue(fakeUser);

    const result = await requireApiUser();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user).toBe(fakeUser);
    }
  });
});
