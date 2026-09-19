import { z } from "zod";
import {
  aliasQuestion,
  createAliasMap,
  dealiasAnswer,
} from "@/lib/ai/attendance-aliases";
import { answerQuestion } from "@/lib/ai/attendance-question";
import { createAttendanceTools } from "@/lib/ai/attendance-tools";
import { getRosterForOrganization } from "@/lib/services/staff-service";
import { QUESTION_MAX_LENGTH, type AskResult } from "@/types/ask";

const questionSchema = z
  .string()
  .trim()
  .min(1, "Ask a question about your team's attendance.")
  .max(QUESTION_MAX_LENGTH, `Keep your question under ${QUESTION_MAX_LENGTH} characters.`);

// Console output becomes a Sentry breadcrumb, and this path sits next to the
// question, which can hold a staff name: log the error's type, never its message.
function failureType(error: unknown): string {
  return error instanceof Error ? error.name : "unknown error";
}

// Never throws, mirroring the handover digest: every failure is a typed result,
// so a page that calls this cannot be broken by the vendor or the database.
// organizationId comes only from the authenticated user, never from the
// question, the model, or the caller's input.
export async function askAttendanceQuestion(
  user: { organizationId: string },
  rawQuestion: string
): Promise<AskResult> {
  const parsed = questionSchema.safeParse(rawQuestion);
  if (!parsed.success) {
    return { status: "invalid", reason: parsed.error.issues[0].message };
  }

  try {
    const roster = await getRosterForOrganization(user.organizationId);
    const aliases = createAliasMap(roster);
    const executor = createAttendanceTools({
      organizationId: user.organizationId,
      aliases,
    });

    const result = await answerQuestion({
      question: aliasQuestion(parsed.data, aliases),
      executor,
    });
    if (result.status !== "ok") {
      return { status: "unavailable" };
    }

    return { status: "ok", answer: dealiasAnswer(result.answer, aliases) };
  } catch (error) {
    console.warn("[ask] could not answer the question:", failureType(error));
    return { status: "unavailable" };
  }
}
