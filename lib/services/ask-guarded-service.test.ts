import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

vi.mock("@/lib/services/ask-cache-service", () => ({
  getCachedAnswer: vi.fn(),
  storeAnswer: vi.fn(),
}));

vi.mock("@/lib/services/ask-rate-limit-service", () => ({
  consumeAskQuota: vi.fn(),
}));

vi.mock("@/lib/services/ask-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/services/ask-service")>(
    "@/lib/services/ask-service"
  );
  return { ...actual, askAttendanceQuestion: vi.fn() };
});

import { getCachedAnswer, storeAnswer } from "@/lib/services/ask-cache-service";
import { consumeAskQuota } from "@/lib/services/ask-rate-limit-service";
import { askAttendanceQuestion } from "@/lib/services/ask-service";
import type { AskResult } from "@/types/ask";
import { QUESTION_MAX_LENGTH } from "@/types/ask";
import { askWithGuards } from "./ask-guarded-service";

const mockedCache = vi.mocked(getCachedAnswer);
const mockedStore = vi.mocked(storeAnswer);
const mockedQuota = vi.mocked(consumeAskQuota);
const mockedEngine = vi.mocked(askAttendanceQuestion);

const user = { id: "user-session", organizationId: "org-session" };
const QUESTION = "Who worked the most hours?";
const ANSWERED_AT = new Date("2026-09-19T12:00:00.000Z");
const ANSWER = "Priya Nowak, 32 hours.";
const ok: AskResult = { status: "ok", answer: ANSWER, answeredAt: ANSWERED_AT };

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  mockedCache.mockResolvedValue(null);
  mockedQuota.mockResolvedValue({ status: "allowed", remaining: 9 });
  mockedEngine.mockResolvedValue(ok);
  mockedStore.mockResolvedValue(undefined);
});

describe("askWithGuards", () => {
  it("rejects an invalid question before it touches the cache, the limiter or the engine", async () => {
    for (const question of ["", "   ", "a".repeat(QUESTION_MAX_LENGTH + 1)]) {
      const result = await askWithGuards(user, question);
      expect(result.status).toBe("invalid");
    }

    expect(mockedCache).not.toHaveBeenCalled();
    expect(mockedQuota).not.toHaveBeenCalled();
    expect(mockedEngine).not.toHaveBeenCalled();
  });

  it("serves a cache hit without spending quota or calling the engine", async () => {
    mockedCache.mockResolvedValue({ answer: "From the cache.", answeredAt: ANSWERED_AT });

    const result = await askWithGuards(user, QUESTION);

    expect(result).toEqual({ status: "ok", answer: "From the cache.", answeredAt: ANSWERED_AT });
    expect(mockedQuota).not.toHaveBeenCalled();
    expect(mockedEngine).not.toHaveBeenCalled();
    expect(mockedStore).not.toHaveBeenCalled();
  });

  it("on a miss spends quota, runs the engine and stores the answer", async () => {
    const result = await askWithGuards(user, QUESTION);

    expect(result).toEqual(ok);
    expect(mockedQuota).toHaveBeenCalledTimes(1);
    expect(mockedEngine).toHaveBeenCalledTimes(1);
    expect(mockedStore).toHaveBeenCalledWith("org-session", QUESTION, ANSWER, ANSWERED_AT);
  });

  it("returns rate_limited with the wait and does not run the engine", async () => {
    mockedQuota.mockResolvedValue({ status: "limited", retryAfterSeconds: 1234 });

    const result = await askWithGuards(user, QUESTION);

    expect(result).toEqual({ status: "rate_limited", retryAfterSeconds: 1234 });
    expect(mockedEngine).not.toHaveBeenCalled();
    expect(mockedStore).not.toHaveBeenCalled();
  });

  it("still serves a cached answer to a user who is over the limit", async () => {
    mockedQuota.mockResolvedValue({ status: "limited", retryAfterSeconds: 60 });
    mockedCache.mockResolvedValue({ answer: "Cached.", answeredAt: ANSWERED_AT });

    await expect(askWithGuards(user, QUESTION)).resolves.toMatchObject({ status: "ok" });
    expect(mockedQuota).not.toHaveBeenCalled();
  });

  it("fails closed when the limiter errors: unavailable, and no engine call", async () => {
    mockedQuota.mockResolvedValue({ status: "error" });

    await expect(askWithGuards(user, QUESTION)).resolves.toEqual({ status: "unavailable" });
    expect(mockedEngine).not.toHaveBeenCalled();
  });

  it("returns an engine failure as it is and does not cache it", async () => {
    mockedEngine.mockResolvedValue({ status: "unavailable" });

    await expect(askWithGuards(user, QUESTION)).resolves.toEqual({ status: "unavailable" });
    expect(mockedStore).not.toHaveBeenCalled();
  });

  it("takes the organization and user from the session user for every service", async () => {
    await askWithGuards(user, QUESTION);

    expect(mockedCache).toHaveBeenCalledWith("org-session", QUESTION);
    expect(mockedQuota).toHaveBeenCalledWith("user-session");
    expect(mockedEngine).toHaveBeenCalledWith({ organizationId: "org-session" }, QUESTION);
    expect(mockedStore.mock.calls[0][0]).toBe("org-session");
  });

  it("keys the cache on the trimmed question", async () => {
    await askWithGuards(user, `  ${QUESTION}  `);

    expect(mockedCache).toHaveBeenCalledWith("org-session", QUESTION);
  });

  it("makes one engine call for identical concurrent questions but charges each user", async () => {
    let finish: (result: AskResult) => void = () => {};
    mockedEngine.mockReturnValue(new Promise<AskResult>((resolve) => (finish = resolve)));

    const first = askWithGuards(user, QUESTION);
    const second = askWithGuards({ id: "user-other", organizationId: "org-session" }, QUESTION);
    await vi.waitFor(() => expect(mockedQuota).toHaveBeenCalledTimes(2));
    finish(ok);

    await expect(Promise.all([first, second])).resolves.toEqual([ok, ok]);
    expect(mockedEngine).toHaveBeenCalledTimes(1);
    expect(mockedQuota.mock.calls.map((call) => call[0]).sort()).toEqual([
      "user-other",
      "user-session",
    ]);
  });

  it("does not coalesce the same question across organizations", async () => {
    const finishers: ((result: AskResult) => void)[] = [];
    mockedEngine.mockImplementation(
      () => new Promise<AskResult>((resolve) => finishers.push(resolve))
    );

    const first = askWithGuards(user, QUESTION);
    const second = askWithGuards({ id: "user-b", organizationId: "org-b" }, QUESTION);
    await vi.waitFor(() => expect(mockedEngine).toHaveBeenCalledTimes(2));
    finishers.forEach((finish) => finish(ok));

    await Promise.all([first, second]);
    expect(mockedEngine.mock.calls.map((call) => call[0].organizationId).sort()).toEqual([
      "org-b",
      "org-session",
    ]);
  });

  it("does not spend a vendor call when an identical question stored its answer while the quota was being checked", async () => {
    mockedCache
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ answer: "Stored meanwhile.", answeredAt: ANSWERED_AT });

    const result = await askWithGuards(user, QUESTION);

    expect(result).toEqual({ status: "ok", answer: "Stored meanwhile.", answeredAt: ANSWERED_AT });
    expect(mockedEngine).not.toHaveBeenCalled();
    expect(mockedStore).not.toHaveBeenCalled();
  });

  it("starts a fresh engine call once an earlier one has settled", async () => {
    await askWithGuards(user, QUESTION);
    await askWithGuards(user, QUESTION);

    expect(mockedEngine).toHaveBeenCalledTimes(2);
  });

  it("returns unavailable instead of throwing, logging only the error type", async () => {
    mockedCache.mockRejectedValue(new Error("Priya Nowak lookup failed at db.internal"));

    await expect(askWithGuards(user, QUESTION)).resolves.toEqual({ status: "unavailable" });

    const logged = vi.mocked(console.warn).mock.calls.flat().map(String).join(" ");
    expect(logged).toContain("Error");
    expect(logged).not.toMatch(/priya|db\.internal/i);
  });
});
