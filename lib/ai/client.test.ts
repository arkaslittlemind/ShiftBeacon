import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AiUnavailableError, generateJson, isAiConfigured } from "./client";

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
