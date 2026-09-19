import { hashQuestion } from "@/lib/ai/normalize-question";
import { prisma } from "@/lib/prisma";
import { errorTypeOnly } from "@/lib/redaction";

// Short on purpose: an answer is built from shift data that keeps changing as
// people clock out, so a long-lived one would read as current when it is not.
export const ASK_CACHE_TTL_MS = 15 * 60 * 1000;

export type CachedAnswer = { answer: string; answeredAt: Date };

function answerKey(organizationId: string, question: string) {
  return {
    organizationId_questionHash: { organizationId, questionHash: hashQuestion(question) },
  };
}

// The cache is an optimization, so neither function throws: a read that fails is
// a miss and a write that fails is dropped. Both log the error type only, since
// this path sits next to the question and the answer.
export async function getCachedAnswer(
  organizationId: string,
  question: string,
  now: Date = new Date()
): Promise<CachedAnswer | null> {
  try {
    const row = await prisma.askAnswer.findUnique({ where: answerKey(organizationId, question) });
    if (!row || now.getTime() - row.answeredAt.getTime() >= ASK_CACHE_TTL_MS) {
      return null;
    }
    return { answer: row.answer, answeredAt: row.answeredAt };
  } catch (error) {
    console.warn("[ask] could not read the answer cache:", errorTypeOnly(error));
    return null;
  }
}

export async function storeAnswer(
  organizationId: string,
  question: string,
  answer: string,
  now: Date = new Date()
): Promise<void> {
  try {
    await prisma.askAnswer.upsert({
      where: answerKey(organizationId, question),
      update: { answer, answeredAt: now },
      create: {
        organizationId,
        questionHash: hashQuestion(question),
        answer,
        answeredAt: now,
      },
    });
  } catch (error) {
    console.warn("[ask] could not cache the answer:", errorTypeOnly(error));
    return;
  }

  // Expired rows are never read again, so removing them here keeps the table
  // from growing without a scheduled job.
  try {
    await prisma.askAnswer.deleteMany({
      where: {
        organizationId,
        answeredAt: { lt: new Date(now.getTime() - ASK_CACHE_TTL_MS) },
      },
    });
  } catch (error) {
    console.warn("[ask] could not prune the answer cache:", errorTypeOnly(error));
  }
}
