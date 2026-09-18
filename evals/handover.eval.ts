import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { HandoverDigest } from "@/types/handover";
import { AiUnavailableError } from "@/lib/ai/client";
import { digestSchema, generateDigest } from "@/lib/ai/handover-digest";
import { EVAL_CASES, type EvalCase } from "./handover-cases";

// Opt-in and quota-consuming: this suite calls the real API, so it is not part
// of `npm test`. See the Commands section of AGENTS.md.

const DATE = "2026-09-17";

// Free tier for gemini-2.5-flash allows 5 requests per minute, so cases need
// at least 12s between them. Override with EVAL_DELAY_MS on a tier that allows
// more. Note the separate daily cap, which pacing cannot work around: see the
// note on EVAL_CASES about keeping the set within one day's quota.
const DELAY_MS = Number(process.env.EVAL_DELAY_MS ?? 13_000);

// A 429 is the expected steady state on the free tier, not a result. Retrying
// it keeps a rate limit from being reported as a model quality failure. Used
// only when the provider does not state its own retryDelay.
const RETRY_BACKOFF_MS = [20_000, 45_000];

// A per-day quota does not clear within a test run, so honouring a delay that
// long would just stall the suite instead of failing it honestly.
const MAX_RETRY_WAIT_MS = 90_000;

type CaseScore = { id: string; recalled: number; total: number; missing: string[] };

const scores: CaseScore[] = [];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimit(error: unknown): boolean {
  return error instanceof Error && error.message.includes("429");
}

// The provider states a retryDelay on a rate limit; prefer it over our guess.
// A delay past MAX_RETRY_WAIT_MS means a per-day ceiling, which no amount of
// waiting inside one run will clear, so that fails fast instead.
function waitFor(error: unknown, attempt: number): number | null {
  const stated = error instanceof AiUnavailableError ? error.retryAfterMs : undefined;
  if (stated !== undefined) {
    return stated <= MAX_RETRY_WAIT_MS ? stated : null;
  }
  return attempt < RETRY_BACKOFF_MS.length ? RETRY_BACKOFF_MS[attempt] : null;
}

async function generateWithRetry(
  notes: string[]
): Promise<HandoverDigest | null> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await generateDigest(notes, DATE);
    } catch (error) {
      const wait = isRateLimit(error) ? waitFor(error, attempt) : null;
      if (wait === null) {
        throw error;
      }
      await sleep(wait);
    }
  }
}

function scoreCase(testCase: EvalCase, haystack: string): CaseScore {
  const missing = testCase.expectedFacts
    .filter((fact) => !fact.anyOf.some((phrase) => haystack.includes(phrase.toLowerCase())))
    .map((fact) => fact.label);

  return {
    id: testCase.id,
    recalled: testCase.expectedFacts.length - missing.length,
    total: testCase.expectedFacts.length,
    missing,
  };
}

describe("handover digest evals", () => {
  beforeAll(() => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is not set. The eval suite calls the real API and cannot run without it."
      );
    }
  });

  afterAll(() => {
    const recalled = scores.reduce((sum, score) => sum + score.recalled, 0);
    const total = scores.reduce((sum, score) => sum + score.total, 0);
    const failed = scores.filter((score) => score.missing.length > 0);

    console.log("\nHandover digest eval results");
    for (const score of scores) {
      const mark = score.missing.length === 0 ? "PASS" : "FAIL";
      const detail = score.missing.length === 0 ? "" : ` missing: ${score.missing.join(", ")}`;
      console.log(`  ${mark} ${score.id} (${score.recalled}/${score.total})${detail}`);
    }
    console.log(
      `\n  Cases: ${scores.length - failed.length}/${scores.length} passed. ` +
        `Key-fact recall: ${recalled}/${total}` +
        (total > 0 ? ` (${((recalled / total) * 100).toFixed(1)}%)` : "")
    );
  });

  // In afterEach, so the pacing gap is honoured whether the case passed,
  // failed, or threw. Putting it after the call meant a thrown rate limit
  // skipped it and every remaining case stampeded the same limit.
  afterEach(async () => {
    if (DELAY_MS > 0) {
      await sleep(DELAY_MS);
    }
  });

  for (const testCase of EVAL_CASES) {
    it(
      testCase.id,
      async () => {
        // A hard failure has to be scored before it is asserted, or the
        // aggregate would be computed over survivors only and read highest
        // exactly when the model is doing worst.
        let digest: HandoverDigest | null = null;
        let reason = "no usable response";
        try {
          digest = await generateWithRetry(testCase.notes);
        } catch (error) {
          reason = error instanceof Error ? error.message : String(error);
        }

        if (!digest || !digestSchema.safeParse(digest).success) {
          scores.push({
            id: testCase.id,
            recalled: 0,
            total: testCase.expectedFacts.length,
            missing: [reason],
          });
          expect.fail(reason);
        }

        // Recall is measured across keyPoints and flags together: whether an
        // item is a point or a flag is a judgement call, dropping it is not.
        const haystack = [...digest.keyPoints, ...digest.flags]
          .join(" \n")
          .toLowerCase();
        const score = scoreCase(testCase, haystack);
        scores.push(score);

        expect(score.missing, "facts missing from the digest").toEqual([]);
      },
      180_000
    );
  }
});
