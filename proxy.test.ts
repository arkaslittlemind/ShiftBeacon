// @vitest-environment node
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth0", () => ({
  auth0: { middleware: vi.fn(), getSession: vi.fn() },
}));

import { auth0 } from "@/lib/auth0";
import { proxy } from "./proxy";

const mockedMiddleware = vi.mocked(auth0.middleware);
const mockedGetSession = vi.mocked(auth0.getSession);
const passThrough = NextResponse.next();

const request = (path: string) => new NextRequest(`http://localhost:3000${path}`);

beforeEach(() => {
  vi.clearAllMocks();
  mockedMiddleware.mockResolvedValue(passThrough);
});

describe("proxy", () => {
  it("redirects a signed-out protected request to login with its full path and query", async () => {
    mockedGetSession.mockResolvedValue(null);

    const response = await proxy(request("/manager/staff/x?tab=1"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/login?returnTo=%2Fmanager%2Fstaff%2Fx%3Ftab%3D1"
    );
  });

  it("protects the worker area too", async () => {
    mockedGetSession.mockResolvedValue(null);

    const response = await proxy(request("/worker/home"));

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/login?returnTo=%2Fworker%2Fhome"
    );
  });

  it("passes a signed-in protected request through the Auth0 middleware response", async () => {
    mockedGetSession.mockResolvedValue({ user: { sub: "auth0|1" } } as never);

    await expect(proxy(request("/manager/dashboard"))).resolves.toBe(passThrough);
  });

  it("leaves public and auth routes to the Auth0 middleware without a session check", async () => {
    for (const path of ["/", "/offline", "/auth/login", "/managerial", "/api/me"]) {
      await expect(proxy(request(path))).resolves.toBe(passThrough);
    }
    expect(mockedGetSession).not.toHaveBeenCalled();
  });
});
