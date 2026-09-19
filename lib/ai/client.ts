import "server-only";

import { getEnv } from "@/lib/env";

// Free tier, which is a deliberate choice: the vendor may train on and
// human-review anything sent here, which is why lib/ai/scrub-notes.ts runs on
// every note before a request is built. Treat submitted text as disclosed.
//
// Flash-lite rather than flash because free-tier quotas are per model, and
// flash allows only 20 requests per day, which the eval suite alone exceeds.
// A digest is a short summarization over a handful of short notes, which is
// well within what the lighter model does well. Quotas are checked at
// aistudio.google.com under Rate Limit.
//
// Pin an explicit version rather than a -latest alias: the eval scores mean
// nothing if the model can change underneath them. Check the list endpoint
// before changing it, because ids are retired without much notice.
const MODEL = "gemini-3.5-flash-lite";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// The dashboard renders server-side, so a vendor that accepts the connection
// and then stalls would hold the whole page. Nothing here is worth that.
const TIMEOUT_MS = 10_000;

export function isAiConfigured(): boolean {
  return Boolean(getEnv().GEMINI_API_KEY);
}

export class AiUnavailableError extends Error {
  // Set only when the provider told us how long to wait, so a caller can back
  // off by the stated delay instead of guessing.
  readonly retryAfterMs?: number;

  constructor(message: string, retryAfterMs?: number) {
    super(message);
    this.name = "AiUnavailableError";
    this.retryAfterMs = retryAfterMs;
  }
}

// An error body can echo the prompt back, so nothing here is passed through on
// trust. Only these structured quota identifiers are read, never the body's
// free-text `message`, and an id has to look like an identifier to be used at
// all: a rate limit should tell us which ceiling we hit without becoming
// another way for note text to reach a log.
const QUOTA_ID = /^[A-Za-z0-9_.\-/]+$/;

function identifier(value: unknown): string | undefined {
  return typeof value === "string" && QUOTA_ID.test(value) ? value : undefined;
}

function retryDelayMs(value: unknown): number | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const seconds = /^(\d+(?:\.\d+)?)s$/.exec(value);
  return seconds ? Math.ceil(Number(seconds[1]) * 1000) : undefined;
}

type ErrorDetail = {
  violations?: { quotaId?: unknown; quotaValue?: unknown }[];
  retryDelay?: unknown;
};

type ErrorBody = {
  error?: { status?: unknown; details?: ErrorDetail[] };
};

async function readErrorDetail(
  response: Response
): Promise<{ detail?: string; retryAfterMs?: number }> {
  let body: ErrorBody;
  try {
    body = (await response.json()) as ErrorBody;
  } catch {
    return {};
  }

  const parts: string[] = [];
  let retryAfterMs: number | undefined;

  // A status enum such as NOT_FOUND or RESOURCE_EXHAUSTED, which distinguishes
  // a retired model id from an exhausted quota. The `message` beside it often
  // explains more, but it is free text that can quote the request, so it stays
  // unread.
  const status = identifier(body.error?.status);
  if (status) {
    parts.push(status);
  }

  for (const detail of body.error?.details ?? []) {
    for (const violation of detail.violations ?? []) {
      const id = identifier(violation.quotaId);
      const limit = identifier(violation.quotaValue);
      if (id) {
        parts.push(limit ? `${id} limit=${limit}` : id);
      }
    }
    retryAfterMs = retryAfterMs ?? retryDelayMs(detail.retryDelay);
  }

  if (retryAfterMs !== undefined) {
    parts.push(`retryAfter=${Math.round(retryAfterMs / 1000)}s`);
  }

  return { detail: parts.length > 0 ? parts.join(", ") : undefined, retryAfterMs };
}

export type GenerateJsonOptions = {
  systemInstruction: string;
  prompt: string;
  responseSchema: Record<string, unknown>;
};

type ResponsePart = Record<string, unknown>;

type GenerateContentPayload = {
  candidates?: { content?: { role?: string; parts?: ResponsePart[] } }[];
};

// The one place a request leaves the app, so the key check, timeout and error
// handling cannot drift between the JSON and tool-calling paths.
async function postToGemini(
  body: Record<string, unknown>
): Promise<GenerateContentPayload> {
  const apiKey = getEnv().GEMINI_API_KEY;
  if (!apiKey) {
    throw new AiUnavailableError("GEMINI_API_KEY is not configured");
  }

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new AiUnavailableError(
      `Request to the AI provider failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  if (!response.ok) {
    const quota = await readErrorDetail(response);
    throw new AiUnavailableError(
      `AI provider responded with ${response.status}` +
        (quota.detail ? ` (${quota.detail})` : ""),
      quota.retryAfterMs
    );
  }

  return (await response.json()) as GenerateContentPayload;
}

// Returns parsed JSON, unvalidated. Callers own the schema check, because the
// model returning well-formed JSON of the wrong shape is a normal outcome here
// rather than an exceptional one.
export async function generateJson(
  options: GenerateJsonOptions
): Promise<unknown> {
  const payload = await postToGemini({
    systemInstruction: { parts: [{ text: options.systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: options.prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: options.responseSchema,
    },
  });

  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string" || !text) {
    throw new AiUnavailableError("AI provider returned no content");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new AiUnavailableError("AI provider returned unparseable JSON");
  }
}

export type FunctionDeclaration = {
  name: string;
  description: string;
  // Omitted for a tool that takes none: an empty object schema is rejected.
  parameters?: Record<string, unknown>;
};

// Parts are opaque on purpose: a model turn has to be sent back exactly as it
// arrived, including fields this app does not read, such as a thought
// signature that newer models require on the follow-up request.
export type ConversationContent = {
  role: "user" | "model";
  parts: ResponsePart[];
};

export type FunctionCall = { name: string; args: unknown };

export type ToolTurn =
  | { kind: "calls"; calls: FunctionCall[]; modelContent: ConversationContent }
  | { kind: "text"; text: string; modelContent: ConversationContent };

export type GenerateWithToolsOptions = {
  systemInstruction: string;
  contents: ConversationContent[];
  functionDeclarations: FunctionDeclaration[];
};

function isFunctionCallPart(
  part: ResponsePart
): part is { functionCall: { name: string; args?: unknown } } {
  const call = part.functionCall;
  return (
    typeof call === "object" &&
    call !== null &&
    typeof (call as { name?: unknown }).name === "string"
  );
}

// One model turn of a function-calling conversation: either the calls it wants
// run, or its final text. The caller owns the loop. Function calling cannot be
// combined with JSON-schema output, so the final answer is plain text.
export async function generateWithTools(
  options: GenerateWithToolsOptions
): Promise<ToolTurn> {
  const payload = await postToGemini({
    systemInstruction: { parts: [{ text: options.systemInstruction }] },
    contents: options.contents,
    tools: [{ functionDeclarations: options.functionDeclarations }],
  });

  const parts = payload.candidates?.[0]?.content?.parts;
  if (!parts || parts.length === 0) {
    throw new AiUnavailableError("AI provider returned no content");
  }

  const modelContent: ConversationContent = { role: "model", parts };

  const calls = parts
    .filter(isFunctionCallPart)
    .map((part) => ({
      name: part.functionCall.name,
      args: part.functionCall.args ?? {},
    }));
  if (calls.length > 0) {
    return { kind: "calls", calls, modelContent };
  }

  const text = parts
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();
  if (!text) {
    throw new AiUnavailableError("AI provider returned no content");
  }

  return { kind: "text", text, modelContent };
}
