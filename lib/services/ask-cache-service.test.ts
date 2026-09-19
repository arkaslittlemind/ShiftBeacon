import { beforeEach, describe, expect, it, vi } from "vitest";

const askAnswer = vi.hoisted(() => ({
  findUnique: vi.fn(),
  upsert: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { askAnswer } }));

import { hashQuestion } from "@/lib/ai/normalize-question";
import {
  ASK_CACHE_TTL_MS,
  getCachedAnswer,
  storeAnswer,
} from "./ask-cache-service";

const NOW = new Date("2026-09-19T12:00:00.000Z");
const QUESTION = "How many hours did Priya Nowak work this week?";
const HASH = hashQuestion(QUESTION);

function rowAged(ms: number) {
  return { answer: "Priya Nowak worked 32 hours.", answeredAt: new Date(NOW.getTime() - ms) };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  askAnswer.findUnique.mockResolvedValue(null);
  askAnswer.upsert.mockResolvedValue({});
  askAnswer.deleteMany.mockResolvedValue({ count: 0 });
});

describe("getCachedAnswer", () => {
  it("returns a fresh answer with the time it was produced", async () => {
    const row = rowAged(60_000);
    askAnswer.findUnique.mockResolvedValue(row);

    await expect(getCachedAnswer("org-1", QUESTION, NOW)).resolves.toEqual(row);
  });

  it("treats a row one millisecond inside the TTL as a hit and one at the TTL as a miss", async () => {
    askAnswer.findUnique.mockResolvedValue(rowAged(ASK_CACHE_TTL_MS - 1));
    await expect(getCachedAnswer("org-1", QUESTION, NOW)).resolves.not.toBeNull();

    askAnswer.findUnique.mockResolvedValue(rowAged(ASK_CACHE_TTL_MS));
    await expect(getCachedAnswer("org-1", QUESTION, NOW)).resolves.toBeNull();
  });

  it("returns null when there is no row", async () => {
    await expect(getCachedAnswer("org-1", QUESTION, NOW)).resolves.toBeNull();
  });

  it("looks up by the given organization and the hash of the normalized question", async () => {
    await getCachedAnswer("org-1", "  HOW many hours did Priya Nowak work this week ?", NOW);

    expect(askAnswer.findUnique).toHaveBeenCalledWith({
      where: { organizationId_questionHash: { organizationId: "org-1", questionHash: HASH } },
    });
  });

  it("treats a database error as a miss and logs only the error type", async () => {
    askAnswer.findUnique.mockRejectedValue(new Error("Priya Nowak query failed at db.internal"));

    await expect(getCachedAnswer("org-1", QUESTION, NOW)).resolves.toBeNull();

    const logged = vi.mocked(console.warn).mock.calls.flat().map(String).join(" ");
    expect(logged).toContain("Error");
    expect(logged).not.toMatch(/priya|nowak|db\.internal/i);
  });
});

describe("storeAnswer", () => {
  it("upserts under the organization and question hash without storing the question", async () => {
    await storeAnswer("org-1", QUESTION, "Priya Nowak worked 32 hours.", NOW);

    const call = askAnswer.upsert.mock.calls[0][0];
    expect(call.where).toEqual({
      organizationId_questionHash: { organizationId: "org-1", questionHash: HASH },
    });
    expect(call.create).toEqual({
      organizationId: "org-1",
      questionHash: HASH,
      answer: "Priya Nowak worked 32 hours.",
      answeredAt: NOW,
    });
    expect(call.update).toEqual({ answer: "Priya Nowak worked 32 hours.", answeredAt: NOW });
    expect(JSON.stringify(call)).not.toContain("How many hours");
  });

  it("prunes only that organization's expired rows", async () => {
    await storeAnswer("org-1", QUESTION, "An answer.", NOW);

    expect(askAnswer.deleteMany).toHaveBeenCalledWith({
      where: {
        organizationId: "org-1",
        answeredAt: { lt: new Date(NOW.getTime() - ASK_CACHE_TTL_MS) },
      },
    });
  });

  it("does not throw or prune when the write fails, and logs only the error type", async () => {
    askAnswer.upsert.mockRejectedValue(new Error("duplicate key for Priya Nowak's answer"));

    await expect(storeAnswer("org-1", QUESTION, "An answer.", NOW)).resolves.toBeUndefined();

    expect(askAnswer.deleteMany).not.toHaveBeenCalled();
    const logged = vi.mocked(console.warn).mock.calls.flat().map(String).join(" ");
    expect(logged).toContain("Error");
    expect(logged).not.toMatch(/priya|duplicate/i);
  });

  it("does not throw when pruning fails", async () => {
    askAnswer.deleteMany.mockRejectedValue(new Error("boom"));

    await expect(storeAnswer("org-1", QUESTION, "An answer.", NOW)).resolves.toBeUndefined();
  });
});
