import { z } from "zod";
import { requireApiUser } from "@/lib/api/auth";
import { withRouteHandler } from "@/lib/api/handler";
import { apiError, apiSuccess } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validate";
import { askWithGuards } from "@/lib/services/ask-guarded-service";
import type { AskResponse } from "@/types/ask";

// One question is up to MAX_MODEL_ROUNDS sequential vendor calls of up to 10
// seconds each, which is longer than a platform's default function limit.
export const maxDuration = 60;

// No length rule here: askWithGuards owns question validation, so the rules
// live in one place.
const askBodySchema = z.object({ question: z.string() });

export const POST = withRouteHandler(
  "POST /api/manager/ask",
  async (request: Request) => {
    const result = await requireApiUser({ role: "MANAGER" });
    if (!result.ok) {
      return result.response;
    }

    const parsed = await parseJsonBody(request, askBodySchema);
    if (!parsed.ok) {
      return parsed.response;
    }

    const answer = await askWithGuards(
      { id: result.user.id, organizationId: result.user.organizationId },
      parsed.data.question
    );

    switch (answer.status) {
      case "ok": {
        const body: AskResponse = {
          answer: answer.answer,
          answeredAt: answer.answeredAt.toISOString(),
        };
        return apiSuccess(body);
      }
      case "invalid":
        return apiError(400, answer.reason);
      case "rate_limited": {
        const response = apiError(
          429,
          "You have used your questions for this hour."
        );
        response.headers.set("Retry-After", String(answer.retryAfterSeconds));
        return response;
      }
      case "unavailable":
        return apiError(503, "Answers are unavailable right now.");
    }
  }
);
