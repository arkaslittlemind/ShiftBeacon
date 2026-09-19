import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  askUsage: { deleteMany: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: db }));

import { ASK_LIMIT_PER_HOUR } from "@/types/ask";
import { consumeAskQuota } from "./ask-rate-limit-service";

const NOW = new Date("2026-09-19T12:20:30.000Z");
const WINDOW_START = new Date("2026-09-19T12:00:00.000Z");

function countIs(count: number) {
  db.$queryRaw.mockResolvedValue([{ count }]);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  countIs(1);
  db.askUsage.deleteMany.mockResolvedValue({ count: 0 });
});

describe("consumeAskQuota", () => {
  it("allows the first question and reports what is left", async () => {
    await expect(consumeAskQuota("user-1", NOW)).resolves.toEqual({
      status: "allowed",
      remaining: ASK_LIMIT_PER_HOUR - 1,
    });
  });

  it("allows the question that reaches the limit and limits the one after it", async () => {
    countIs(ASK_LIMIT_PER_HOUR);
    await expect(consumeAskQuota("user-1", NOW)).resolves.toEqual({
      status: "allowed",
      remaining: 0,
    });

    countIs(ASK_LIMIT_PER_HOUR + 1);
    const limited = await consumeAskQuota("user-1", NOW);
    expect(limited.status).toBe("limited");
  });

  it("tells a limited user how long until the next hour starts", async () => {
    countIs(ASK_LIMIT_PER_HOUR + 1);

    await expect(consumeAskQuota("user-1", NOW)).resolves.toEqual({
      status: "limited",
      retryAfterSeconds: 39 * 60 + 30,
    });
  });

  it("reports a full hour when a window has only just opened", async () => {
    countIs(ASK_LIMIT_PER_HOUR + 1);

    await expect(consumeAskQuota("user-1", WINDOW_START)).resolves.toEqual({
      status: "limited",
      retryAfterSeconds: 3600,
    });
  });

  it("counts against the window that contains now, so a new hour starts fresh", async () => {
    await consumeAskQuota("user-1", NOW);
    await consumeAskQuota("user-1", new Date("2026-09-19T13:00:00.000Z"));

    const windows = db.$queryRaw.mock.calls.map((call) => call[2]);
    expect(windows).toEqual([WINDOW_START, new Date("2026-09-19T13:00:00.000Z")]);
  });

  it("increments the row of the given user in a single statement", async () => {
    await consumeAskQuota("user-42", NOW);

    expect(db.$queryRaw).toHaveBeenCalledTimes(1);
    const [strings, userId] = db.$queryRaw.mock.calls[0];
    expect(userId).toBe("user-42");
    expect(strings.join("?")).toMatch(/INSERT INTO "AskUsage"[\s\S]*ON CONFLICT[\s\S]*DO UPDATE[\s\S]*RETURNING/);
  });

  it("removes only that user's rows from earlier windows", async () => {
    await consumeAskQuota("user-1", NOW);

    expect(db.askUsage.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user-1", windowStart: { lt: WINDOW_START } },
    });
  });

  it("still answers when the prune fails", async () => {
    db.askUsage.deleteMany.mockRejectedValue(new Error("boom"));

    await expect(consumeAskQuota("user-1", NOW)).resolves.toMatchObject({ status: "allowed" });
  });

  it("still answers when the prune throws before it even returns a promise", async () => {
    db.askUsage.deleteMany.mockImplementation(() => {
      throw new TypeError("Cannot read properties of undefined");
    });

    await expect(consumeAskQuota("user-1", NOW)).resolves.toMatchObject({ status: "allowed" });
  });

  it("returns error, never a pass, when the database fails, and logs only the type", async () => {
    db.$queryRaw.mockRejectedValue(new Error("connection to db.internal refused"));

    await expect(consumeAskQuota("user-1", NOW)).resolves.toEqual({ status: "error" });

    const logged = vi.mocked(console.warn).mock.calls.flat().map(String).join(" ");
    expect(logged).toContain("Error");
    expect(logged).not.toMatch(/db\.internal/);
  });

  it("returns error when the statement returns no usable count", async () => {
    db.$queryRaw.mockResolvedValue([]);
    await expect(consumeAskQuota("user-1", NOW)).resolves.toEqual({ status: "error" });

    db.$queryRaw.mockResolvedValue([{ count: "many" }]);
    await expect(consumeAskQuota("user-1", NOW)).resolves.toEqual({ status: "error" });
  });
});
