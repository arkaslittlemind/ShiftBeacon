import { hashQuestion } from "@/lib/ai/normalize-question";
import { errorTypeOnly } from "@/lib/redaction";
import { getCachedAnswer, storeAnswer } from "@/lib/services/ask-cache-service";
import { consumeAskQuota } from "@/lib/services/ask-rate-limit-service";
import { askAttendanceQuestion, validateQuestion } from "@/lib/services/ask-service";
import type { AskResult } from "@/types/ask";

// Coalesces identical questions asked at the same moment within one process, so
// two managers pressing a starter question together spend one vendor call. Only
// the engine call is shared: the rate limit is per user, and sharing it would
// hand one user's "rate limited" to another. As with the handover digest, this
// cannot see across separate serverless instances.
const inFlight = new Map<string, Promise<AskResult>>();

function answerOnce(organizationId: string, question: string): Promise<AskResult> {
  const key = `${organizationId}:${hashQuestion(question)}`;
  const existing = inFlight.get(key);
  if (existing) {
    return existing;
  }

  const promise = answerFresh(organizationId, question).finally(() => {
    inFlight.delete(key);
  });
  inFlight.set(key, promise);
  return promise;
}

// The cache is read again here because the caller's first read came before an
// awaited quota check. In that gap an identical question can finish, store its
// answer and leave the in-flight map, so without this the caller would spend a
// second vendor call on an answer that now exists.
async function answerFresh(organizationId: string, question: string): Promise<AskResult> {
  const cached = await getCachedAnswer(organizationId, question);
  if (cached) {
    return { status: "ok", ...cached };
  }

  const result = await askAttendanceQuestion({ organizationId }, question);
  // Only an answer is worth keeping. A failure cached here would outlive the
  // outage that caused it.
  if (result.status === "ok") {
    await storeAnswer(organizationId, question, result.answer, result.answeredAt);
  }
  return result;
}

// The entry point a route or Server Action calls. The order is deliberate: a
// cache hit costs no vendor quota, so it neither spends the user's allowance nor
// is blocked by an exhausted one. Never throws. Both ids come from the
// authenticated user, never from the question or the caller's input.
export async function askWithGuards(
  user: { id: string; organizationId: string },
  rawQuestion: string
): Promise<AskResult> {
  const validation = validateQuestion(rawQuestion);
  if (!validation.valid) {
    return { status: "invalid", reason: validation.reason };
  }
  const { question } = validation;

  try {
    const cached = await getCachedAnswer(user.organizationId, question);
    if (cached) {
      return { status: "ok", ...cached };
    }

    const quota = await consumeAskQuota(user.id);
    if (quota.status === "error") {
      return { status: "unavailable" };
    }
    if (quota.status === "limited") {
      return { status: "rate_limited", retryAfterSeconds: quota.retryAfterSeconds };
    }

    return await answerOnce(user.organizationId, question);
  } catch (error) {
    // Type only: the question can hold a staff name.
    console.warn("[ask] guarded question failed:", errorTypeOnly(error));
    return { status: "unavailable" };
  }
}
