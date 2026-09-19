"use client";

import { useRef, useState } from "react";
import { MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { eyebrowClass } from "@/lib/utils";
import {
  ASK_LIMIT_PER_HOUR,
  QUESTION_MAX_LENGTH,
  type AskResponse,
} from "@/types/ask";

type AskState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "answer"; answer: AskResponse }
  | { kind: "invalid"; message: string }
  | { kind: "rate_limited"; minutes: number }
  | { kind: "unavailable" };

const UNAVAILABLE_MESSAGE =
  "Answers are unavailable right now. Your data is unaffected; try again in a moment.";

const ERROR_ID = "ask-card-error";

function retryMinutes(header: string | null): number {
  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds > 0 ? Math.max(1, Math.ceil(seconds / 60)) : 1;
}

function errorMessage(state: AskState): string | null {
  switch (state.kind) {
    case "invalid":
      return state.message;
    case "rate_limited":
      return `You have used your questions for this hour. Try again in ${state.minutes} ${
        state.minutes === 1 ? "minute" : "minutes"
      }.`;
    case "unavailable":
      return UNAVAILABLE_MESSAGE;
    default:
      return null;
  }
}

function formatAnsweredAt(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function isAskResponse(value: unknown): value is AskResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.answer === "string" &&
    typeof candidate.answeredAt === "string" &&
    !Number.isNaN(Date.parse(candidate.answeredAt))
  );
}

// A gateway timeout answers with an HTML page rather than our JSON, so a body
// that does not parse is a failure to render, not an exception to let through.
async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestAnswer(question: string): Promise<AskState> {
  let response: Response;
  try {
    response = await fetch("/api/manager/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
  } catch {
    return { kind: "unavailable" };
  }

  if (response.status === 429) {
    return { kind: "rate_limited", minutes: retryMinutes(response.headers.get("Retry-After")) };
  }

  const body = (await readJson(response)) as {
    data?: unknown;
    error?: { message?: unknown };
  } | null;

  if (response.ok) {
    return isAskResponse(body?.data)
      ? { kind: "answer", answer: body.data }
      : { kind: "unavailable" };
  }
  if (response.status === 400 && typeof body?.error?.message === "string") {
    return { kind: "invalid", message: body.error.message };
  }
  return { kind: "unavailable" };
}

export function AskCard({ starterQuestions }: { starterQuestions: string[] }) {
  const [question, setQuestion] = useState("");
  const [state, setState] = useState<AskState>({ kind: "idle" });
  // State updates are asynchronous, so two clicks in one tick would both see
  // "not loading". Each request costs quota, so the guard has to be synchronous.
  const inFlight = useRef(false);

  const locked = state.kind === "loading" || state.kind === "rate_limited";

  async function submit(text: string) {
    if (inFlight.current || text.trim() === "") {
      return;
    }
    inFlight.current = true;
    setState({ kind: "loading" });
    try {
      setState(await requestAnswer(text));
    } finally {
      inFlight.current = false;
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void submit(question);
  }

  function handleStarter(text: string) {
    setQuestion(text);
    void submit(text);
  }

  const error = errorMessage(state);

  return (
    <Card>
      <CardHeader>
        <CardTitle className={eyebrowClass}>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircleQuestion className="size-3.5" aria-hidden />
            Ask about attendance
          </span>
        </CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Questions cover the last 7 days of attendance. You can ask{" "}
          {ASK_LIMIT_PER_HOUR} questions an hour.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit} className="grid gap-1.5">
          <label htmlFor="ask-question" className={eyebrowClass}>
            Ask a question
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="ask-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={QUESTION_MAX_LENGTH}
              disabled={locked}
              aria-invalid={state.kind === "invalid"}
              aria-describedby={state.kind === "invalid" ? ERROR_ID : undefined}
            />
            <Button
              type="submit"
              disabled={locked || question.trim() === ""}
              className="min-h-11 sm:min-h-10"
            >
              {state.kind === "loading" ? "Asking..." : "Ask"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {QUESTION_MAX_LENGTH - question.length} characters left
          </p>
        </form>

        <ul className="flex flex-wrap gap-2" aria-label="Suggested questions">
          {starterQuestions.map((starter) => (
            <li key={starter}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={locked}
                onClick={() => handleStarter(starter)}
                className="h-auto min-h-11 py-2 text-left tracking-normal whitespace-normal normal-case sm:min-h-8"
              >
                {starter}
              </Button>
            </li>
          ))}
        </ul>

        {state.kind === "loading" ? (
          <p role="status" className="sr-only">
            Answering your question
          </p>
        ) : null}

        {error ? (
          <p
            id={ERROR_ID}
            role="alert"
            className="translate-y-0 text-sm text-destructive opacity-100 transition-[opacity,transform] duration-200 ease-(--ease-out) starting:-translate-y-1 starting:opacity-0"
          >
            {error}
          </p>
        ) : null}

        {state.kind === "answer" ? (
          <div className="border-t-2 border-border-soft pt-3">
            <p className="text-sm whitespace-pre-wrap">{state.answer.answer}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Answered at {formatAnsweredAt(state.answer.answeredAt)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              AI generated from the last 7 days of attendance data. Check anything you plan to
              act on.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
