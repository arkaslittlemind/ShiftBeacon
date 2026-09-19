import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiError } from "@/lib/api/response";

vi.mock("@/lib/api/auth", () => ({
  requireApiUser: vi.fn(),
}));

vi.mock("@/lib/services/ask-guarded-service", () => ({
  askWithGuards: vi.fn(),
}));

import { requireApiUser } from "@/lib/api/auth";
import { askWithGuards } from "@/lib/services/ask-guarded-service";
import type { UserWithOrganization } from "@/lib/services/user-service";
import { POST } from "./route";

const mockedRequireApiUser = vi.mocked(requireApiUser);
const mockedAsk = vi.mocked(askWithGuards);

const managerUser = {
  id: "manager1",
  role: "MANAGER",
  organizationId: "org1",
} as unknown as UserWithOrganization;

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/manager/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedRequireApiUser.mockResolvedValue({ ok: true, user: managerUser });
});

describe("POST /api/manager/ask", () => {
  it("requests the MANAGER role", async () => {
    mockedAsk.mockResolvedValue({
      status: "ok",
      answer: "x",
      answeredAt: new Date(),
    });

    await POST(buildRequest({ question: "Who worked most?" }));

    expect(mockedRequireApiUser).toHaveBeenCalledWith({ role: "MANAGER" });
  });

  it.each([401, 403])(
    "returns the %i auth response without reaching the engine",
    async (status) => {
      mockedRequireApiUser.mockResolvedValue({
        ok: false,
        response: apiError(status, "no"),
      });

      const response = await POST(buildRequest({ question: "Who worked most?" }));

      expect(response.status).toBe(status);
      expect(mockedAsk).not.toHaveBeenCalled();
    }
  );

  it("uses the session's ids even when the body carries others", async () => {
    mockedAsk.mockResolvedValue({ status: "unavailable" });

    await POST(
      buildRequest({
        question: "Who worked most?",
        organizationId: "other-org",
        userId: "other-user",
        id: "other-user",
      })
    );

    expect(mockedAsk).toHaveBeenCalledWith(
      { id: "manager1", organizationId: "org1" },
      "Who worked most?"
    );
  });

  it.each([
    ["invalid JSON", "{not json"],
    ["a missing question", {}],
    ["a non-string question", { question: 42 }],
  ])("rejects %s with 400 before the engine", async (_label, body) => {
    const response = await POST(buildRequest(body));

    expect(response.status).toBe(400);
    expect(mockedAsk).not.toHaveBeenCalled();
  });

  it("maps ok to 200 with only the answer and an ISO answeredAt", async () => {
    mockedAsk.mockResolvedValue({
      status: "ok",
      answer: "Staff 1 worked 12 hours.",
      answeredAt: new Date("2026-09-19T10:30:00.000Z"),
    });

    const response = await POST(buildRequest({ question: "Who worked most?" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      data: {
        answer: "Staff 1 worked 12 hours.",
        answeredAt: "2026-09-19T10:30:00.000Z",
      },
    });
  });

  it("maps invalid to 400 with the validator's reason", async () => {
    mockedAsk.mockResolvedValue({ status: "invalid", reason: "Too long." });

    const response = await POST(buildRequest({ question: "x" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: { message: "Too long." } });
  });

  it("maps rate_limited to 429 with Retry-After in seconds", async () => {
    mockedAsk.mockResolvedValue({ status: "rate_limited", retryAfterSeconds: 1234 });

    const response = await POST(buildRequest({ question: "Who worked most?" }));

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("1234");
    const body = await response.json();
    expect(body.error.message).toEqual(expect.any(String));
  });

  it("maps unavailable to 503", async () => {
    mockedAsk.mockResolvedValue({ status: "unavailable" });

    const response = await POST(buildRequest({ question: "Who worked most?" }));

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error.message).toEqual(expect.any(String));
  });
});
