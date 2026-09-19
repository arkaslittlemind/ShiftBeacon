import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AiUnavailableError,
  generateJson,
  generateWithTools,
  isAiConfigured,
} from "./client";

let apiKey: string | undefined;

vi.mock("@/lib/env", () => ({
  getEnv: () => ({ GEMINI_API_KEY: apiKey }),
}));

function okResponse(text: string) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ candidates: [{ content: { parts: [{ text }] }}] }),
  } as unknown as Response;
}

// Typed so assertions can reach retryAfterMs without an `any` cast.
async function rejection(promise: Promise<unknown>): Promise<AiUnavailableError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof AiUnavailableError) {
      return error;
    }
    throw error;
  }
  throw new Error("expected the call to reject, but it resolved");
}

const options = {
  systemInstruction: "You summarize handover notes.",
  prompt: "Notes: the hoist in room 4 is grinding.",
  responseSchema: { type: "object", properties: { summary: { type: "string" } } },
};

describe("isAiConfigured", () => {
  it("is false when no key is set", () => {
    apiKey = undefined;
    expect(isAiConfigured()).toBe(false);
  });

  it("is true once a key is set", () => {
    apiKey = "test-key";
    expect(isAiConfigured()).toBe(true);
  });
});

describe("generateJson", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    apiKey = "test-key";
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the parsed JSON the model produced", async () => {
    fetchMock.mockResolvedValue(okResponse('{"summary":"Quiet shift."}'));

    await expect(generateJson(options)).resolves.toEqual({
      summary: "Quiet shift.",
    });
  });

  it("sends the key as a header and the schema as structured output config", async () => {
    fetchMock.mockResolvedValue(okResponse("{}"));

    await generateJson(options);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers["x-goog-api-key"]).toBe("test-key");
    const body = JSON.parse(init.body);
    expect(body.generationConfig.responseMimeType).toBe("application/json");
    expect(body.generationConfig.responseSchema).toEqual(options.responseSchema);
  });

  // The whole point of the optional key: an unconfigured deployment must fail
  // locally and cheaply, without reaching out to anyone.
  it("fails without calling the vendor when no key is configured", async () => {
    apiKey = undefined;

    await expect(generateJson(options)).rejects.toBeInstanceOf(AiUnavailableError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports the status but not the body when the vendor rejects the request", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: options.prompt } }),
    } as unknown as Response);

    await expect(generateJson(options)).rejects.toThrowError(/429/);
    await expect(generateJson(options)).rejects.not.toThrowError(/hoist/);
  });

  // A bare "429" says nothing about which ceiling was hit. These identifiers
  // are structured, so they can be surfaced where the body's prose cannot.
  it("names the quota that was exhausted and how long to wait", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        error: {
          message: `Quota exceeded while processing: ${options.prompt}`,
          details: [
            {
              violations: [
                {
                  quotaId: "GenerateRequestsPerDayPerProjectPerModel-FreeTier",
                  quotaValue: "50",
                },
              ],
            },
            { retryDelay: "31s" },
          ],
        },
      }),
    } as unknown as Response);

    const error = await rejection(generateJson(options));

    expect(error).toBeInstanceOf(AiUnavailableError);
    expect(error.message).toMatch(/PerDayPerProjectPerModel-FreeTier/);
    expect(error.message).toMatch(/limit=50/);
    expect(error.retryAfterMs).toBe(31_000);
    // The same body carried the prompt in its free-text message.
    expect(error.message).not.toMatch(/hoist/i);
  });

  // A retired model id and an exhausted quota are both non-OK responses, and
  // the status enum is what tells them apart.
  it("reports the status enum but not the message explaining it", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        error: {
          status: "NOT_FOUND",
          message: `This model is no longer available. Request was: ${options.prompt}`,
        },
      }),
    } as unknown as Response);

    const error = await rejection(generateJson(options));

    expect(error.message).toBe("AI provider responded with 404 (NOT_FOUND)");
    expect(error.message).not.toMatch(/hoist/i);
  });

  it("ignores a quota id that does not look like an identifier", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        error: {
          details: [
            { violations: [{ quotaId: "the hoist in room 4 is grinding" }] },
          ],
        },
      }),
    } as unknown as Response);

    const error = await rejection(generateJson(options));

    expect(error.message).toBe("AI provider responded with 429");
  });

  it("still reports the status when the error body is not JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => {
        throw new Error("not json");
      },
    } as unknown as Response);

    const error = await rejection(generateJson(options));

    expect(error.message).toBe("AI provider responded with 503");
    expect(error.retryAfterMs).toBeUndefined();
  });

  it("fails cleanly when the transport throws", async () => {
    fetchMock.mockRejectedValue(new Error("timed out"));

    await expect(generateJson(options)).rejects.toBeInstanceOf(AiUnavailableError);
  });

  it("fails cleanly when the model returns something that is not JSON", async () => {
    fetchMock.mockResolvedValue(okResponse("Sorry, I cannot help with that."));

    await expect(generateJson(options)).rejects.toThrowError(/unparseable/i);
  });

  it("fails cleanly when the response carries no content", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ candidates: [] }),
    } as unknown as Response);

    await expect(generateJson(options)).rejects.toThrowError(/no content/i);
  });
});

const toolOptions = {
  systemInstruction: "You answer attendance questions.",
  contents: [{ role: "user" as const, parts: [{ text: "How many hours this week?" }] }],
  functionDeclarations: [
    {
      name: "get_attendance_summary",
      description: "Average hours per day over the last 7 days.",
      parameters: { type: "object", properties: {} },
    },
  ],
};

function partsResponse(parts: Record<string, unknown>[]) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ candidates: [{ content: { role: "model", parts } }] }),
  } as unknown as Response;
}

describe("generateWithTools", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    apiKey = "test-key";
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the key, system instruction, conversation and tool declarations", async () => {
    fetchMock.mockResolvedValue(partsResponse([{ text: "Done." }]));

    await generateWithTools(toolOptions);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers["x-goog-api-key"]).toBe("test-key");
    const body = JSON.parse(init.body);
    expect(body.systemInstruction.parts[0].text).toBe(toolOptions.systemInstruction);
    expect(body.contents).toEqual(toolOptions.contents);
    expect(body.tools).toEqual([
      { functionDeclarations: toolOptions.functionDeclarations },
    ]);
  });

  it("does not ask for JSON output, which cannot be combined with function calling", async () => {
    fetchMock.mockResolvedValue(partsResponse([{ text: "Done." }]));

    await generateWithTools(toolOptions);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.generationConfig?.responseMimeType).toBeUndefined();
    expect(body.generationConfig?.responseSchema).toBeUndefined();
  });

  it("returns the final text when the model answers directly", async () => {
    fetchMock.mockResolvedValue(partsResponse([{ text: "About 6 hours." }]));

    const turn = await generateWithTools(toolOptions);

    expect(turn).toMatchObject({ kind: "text", text: "About 6 hours." });
  });

  it("returns every function call, in order, when the model calls tools", async () => {
    fetchMock.mockResolvedValue(
      partsResponse([
        { functionCall: { name: "get_attendance_summary", args: {} } },
        { functionCall: { name: "get_shift_notes", args: { date: "2026-09-18" } } },
      ])
    );

    const turn = await generateWithTools(toolOptions);

    expect(turn.kind).toBe("calls");
    if (turn.kind === "calls") {
      expect(turn.calls).toEqual([
        { name: "get_attendance_summary", args: {} },
        { name: "get_shift_notes", args: { date: "2026-09-18" } },
      ]);
    }
  });

  it("treats a response with both text and a call as a call", async () => {
    fetchMock.mockResolvedValue(
      partsResponse([
        { text: "Let me check." },
        { functionCall: { name: "get_attendance_summary", args: {} } },
      ])
    );

    const turn = await generateWithTools(toolOptions);

    expect(turn.kind).toBe("calls");
  });

  // Newer models attach a signature to the call part and reject the follow-up
  // if it is not sent back, so the turn has to round-trip untouched.
  it("hands back the model's own turn verbatim so it can be echoed", async () => {
    const parts = [
      {
        functionCall: { name: "get_attendance_summary", args: {} },
        thoughtSignature: "opaque-signature",
      },
    ];
    fetchMock.mockResolvedValue(partsResponse(parts));

    const turn = await generateWithTools(toolOptions);

    expect(turn.modelContent).toEqual({ role: "model", parts });
  });

  it("defaults a missing call argument object to empty", async () => {
    fetchMock.mockResolvedValue(
      partsResponse([{ functionCall: { name: "get_attendance_summary" } }])
    );

    const turn = await generateWithTools(toolOptions);

    expect(turn.kind === "calls" && turn.calls[0].args).toEqual({});
  });

  it("fails without calling the vendor when no key is configured", async () => {
    apiKey = undefined;

    await expect(generateWithTools(toolOptions)).rejects.toBeInstanceOf(AiUnavailableError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports the status but not the body when the vendor rejects the request", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: "How many hours this week?" } }),
    } as unknown as Response);

    const error = await rejection(generateWithTools(toolOptions));

    expect(error.message).toMatch(/429/);
    expect(error.message).not.toMatch(/hours this week/i);
  });

  it("fails cleanly when the transport throws", async () => {
    fetchMock.mockRejectedValue(new Error("timed out"));

    await expect(generateWithTools(toolOptions)).rejects.toBeInstanceOf(AiUnavailableError);
  });

  it("fails cleanly when the response carries no content", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ candidates: [] }),
    } as unknown as Response);

    await expect(generateWithTools(toolOptions)).rejects.toThrowError(/no content/i);
  });

  it("fails cleanly when the parts hold neither text nor a call", async () => {
    fetchMock.mockResolvedValue(partsResponse([{ thought: true }]));

    await expect(generateWithTools(toolOptions)).rejects.toThrowError(/no content/i);
  });
});
