import { beforeEach, describe, expect, it, vi } from "vitest";
import * as Sentry from "@sentry/nextjs";
import { identifySentryUser } from "./identify";

vi.mock("@sentry/nextjs", () => ({
  setUser: vi.fn(),
  setTag: vi.fn(),
}));

describe("identifySentryUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = {
    id: "cmtxblc5e0000w8a31fis64ip",
    auth0UserId: "auth0|abc123",
    name: "Casey Worker",
    email: "casey.worker@example.com",
    role: "CARE_WORKER" as const,
    organizationId: "cmtxbrbtw000010a3ahz8or9f",
  };

  it("identifies by the internal id and nothing else", () => {
    identifySentryUser(user);

    expect(Sentry.setUser).toHaveBeenCalledWith({ id: user.id });
  });

  it("never passes auth0UserId, name, or email to Sentry", () => {
    identifySentryUser(user);

    const serialized = JSON.stringify(vi.mocked(Sentry.setUser).mock.calls);
    expect(serialized).not.toContain("auth0|abc123");
    expect(serialized).not.toContain("Casey Worker");
    expect(serialized).not.toContain("casey.worker@example.com");
  });

  it("tags role and organization for segmenting", () => {
    identifySentryUser(user);

    expect(Sentry.setTag).toHaveBeenCalledWith("role", "CARE_WORKER");
    expect(Sentry.setTag).toHaveBeenCalledWith(
      "organizationId",
      "cmtxbrbtw000010a3ahz8or9f"
    );
  });
});
