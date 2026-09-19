import { prisma } from "@/lib/prisma";
import { errorTypeOnly } from "@/lib/redaction";
import { MS_PER_HOUR } from "@/lib/time";
import { ASK_LIMIT_PER_HOUR } from "@/types/ask";

export type QuotaResult =
  | { status: "allowed"; remaining: number }
  | { status: "limited"; retryAfterSeconds: number }
  | { status: "error" };

// The counter is incremented before it is compared, in one statement, so two
// concurrent questions cannot both read a count under the limit and both pass.
// A read followed by a write would leave exactly that gap. Prisma's upsert is
// only a native INSERT ... ON CONFLICT for some query shapes, so this is written
// out rather than trusting it to be one.
//
// Fixed hourly windows: a user can spend the limit at the end of one hour and
// again at the start of the next. Accepted; a sliding window would need a row
// per question.
//
// Failure is "error", not a pass: this is the guard on shared vendor quota, so a
// broken table must not turn into unmetered calls. Never throws.
export async function consumeAskQuota(
  userId: string,
  now: Date = new Date()
): Promise<QuotaResult> {
  const windowStart = new Date(Math.floor(now.getTime() / MS_PER_HOUR) * MS_PER_HOUR);

  let count: number;
  try {
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "AskUsage" ("userId", "windowStart", "count")
      VALUES (${userId}, ${windowStart}, 1)
      ON CONFLICT ("userId", "windowStart")
      DO UPDATE SET "count" = "AskUsage"."count" + 1
      RETURNING "count"`;
    count = Number(rows[0]?.count);
  } catch (error) {
    console.warn("[ask] could not check the rate limit:", errorTypeOnly(error));
    return { status: "error" };
  }

  if (!Number.isFinite(count)) {
    console.warn("[ask] rate limit statement returned no count");
    return { status: "error" };
  }

  void pruneOlderWindows(userId, windowStart);

  if (count > ASK_LIMIT_PER_HOUR) {
    const windowEnd = windowStart.getTime() + MS_PER_HOUR;
    return {
      status: "limited",
      retryAfterSeconds: Math.ceil((windowEnd - now.getTime()) / 1000),
    };
  }
  return { status: "allowed", remaining: ASK_LIMIT_PER_HOUR - count };
}

// Old windows are never read again. Best effort and not awaited: it must not
// delay or change the answer to the question in hand.
async function pruneOlderWindows(userId: string, windowStart: Date): Promise<void> {
  try {
    await prisma.askUsage.deleteMany({ where: { userId, windowStart: { lt: windowStart } } });
  } catch (error) {
    console.warn("[ask] could not prune old rate limit rows:", errorTypeOnly(error));
  }
}
