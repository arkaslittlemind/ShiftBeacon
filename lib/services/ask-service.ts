import { z } from "zod";
import {
  aliasQuestion,
  createAliasMap,
  dealiasAnswer,
} from "@/lib/ai/attendance-aliases";
import { answerQuestion } from "@/lib/ai/attendance-question";
import { createAttendanceTools } from "@/lib/ai/attendance-tools";
import { errorTypeOnly } from "@/lib/redaction";
import { getRosterForOrganization } from "@/lib/services/staff-service";
import { QUESTION_MAX_LENGTH, type AskResult } from "@/types/ask";

const questionSchema = z
  .string()
  .trim()
  .min(1, "Ask a question about your team's attendance.")
  .max(QUESTION_MAX_LENGTH, `Keep your question under ${QUESTION_MAX_LENGTH} characters.`);

export type QuestionValidation =
  | { valid: true; question: string }
  | { valid: false; reason: string };

// Shared with the guarded entry point so the cache is never keyed on a question
// the engine would have rejected.
export function validateQuestion(rawQuestion: string): QuestionValidation {
  const parsed = questionSchema.safeParse(rawQuestion);
  return parsed.success
    ? { valid: true, question: parsed.data }
    : { valid: false, reason: parsed.error.issues[0].message };
}

// Never throws, mirroring the handover digest: every failure is a typed result,
// so a page that calls this cannot be broken by the vendor or the database.
// organizationId comes only from the authenticated user, never from the
// question, the model, or the caller's input.
export async function askAttendanceQuestion(
  user: { organizationId: string },
  rawQuestion: string
): Promise<AskResult> {
  const validation = validateQuestion(rawQuestion);
  if (!validation.valid) {
    return { status: "invalid", reason: validation.reason };
  }

  try {
    const roster = await getRosterForOrganization(user.organizationId);
    const aliases = createAliasMap(roster);
    const executor = createAttendanceTools({
      organizationId: user.organizationId,
      aliases,
    });

    const result = await answerQuestion({
      question: aliasQuestion(validation.question, aliases),
      executor,
    });
    if (result.status !== "ok") {
      return { status: "unavailable" };
    }

    return {
      status: "ok",
      answer: dealiasAnswer(result.answer, aliases),
      answeredAt: new Date(),
    };
  } catch (error) {
    // Type only: the question can hold a staff name.
    console.warn("[ask] could not answer the question:", errorTypeOnly(error));
    return { status: "unavailable" };
  }
}
