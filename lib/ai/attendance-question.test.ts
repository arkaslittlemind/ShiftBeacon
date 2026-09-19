import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ai/client", () => ({
  generateWithTools: vi.fn(),
  // Real class, not a stub: the engine reads its name to decide what is safe to log.
  AiUnavailableError: class AiUnavailableError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AiUnavailableError";
    }
  },
}));

import { AiUnavailableError, generateWithTools } from "@/lib/ai/client";
import type { ConversationContent, ToolTurn } from "@/lib/ai/client";
import type { ToolExecutor, ToolResult } from "./attendance-tools";
import {
  MAX_CALLS_PER_ROUND,
  MAX_MODEL_ROUNDS,
  SYSTEM_INSTRUCTION,
  answerQuestion,
} from "./attendance-question";

const mockedGenerate = vi.mocked(generateWithTools);

const QUESTION = "Who worked the most hours this week?";

function textTurn(text: string): ToolTurn {
  return { kind: "text", text, modelContent: { role: "model", parts: [{ text }] } };
}

function callsTurn(calls: { name: string; args?: unknown }[]): ToolTurn {
  const normalized = calls.map((call) => ({ name: call.name, args: call.args ?? {} }));
  return {
    kind: "calls",
    calls: normalized,
    modelContent: {
      role: "model",
      parts: normalized.map((call) => ({ functionCall: call })),
    },
  };
}

function buildExecutor(
  results: Record<string, ToolResult> = {}
): ToolExecutor & { execute: ReturnType<typeof vi.fn> } {
  return {
    declarations: [{ name: "get_staff_hours", description: "Hours per staff member." }],
    execute: vi.fn(async (name: string): Promise<ToolResult> => {
      return results[name] ?? { ok: false, error: "Unknown tool." };
    }),
  };
}

function requestAt(call: number) {
  return mockedGenerate.mock.calls[call][0];
}

let consoleSpies: ReturnType<typeof vi.spyOn>[];

beforeEach(() => {
  vi.clearAllMocks();
  consoleSpies = (["log", "info", "warn", "error", "debug"] as const).map((method) =>
    vi.spyOn(console, method).mockImplementation(() => {})
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("answerQuestion", () => {
  it("returns the model's text when it answers without calling a tool", async () => {
    mockedGenerate.mockResolvedValue(textTurn("Staff 1 worked the most."));
    const executor = buildExecutor();

    const result = await answerQuestion({ question: QUESTION, executor });

    expect(result).toEqual({ status: "ok", answer: "Staff 1 worked the most." });
    expect(executor.execute).not.toHaveBeenCalled();
  });

  it("sends the system instruction, the tool declarations and the question", async () => {
    mockedGenerate.mockResolvedValue(textTurn("Done."));
    const executor = buildExecutor();

    await answerQuestion({ question: QUESTION, executor });

    expect(requestAt(0)).toEqual({
      systemInstruction: SYSTEM_INSTRUCTION,
      functionDeclarations: executor.declarations,
      contents: [{ role: "user", parts: [{ text: QUESTION }] }],
    });
  });

  it("runs a requested tool and feeds its result into the next request", async () => {
    const turn = callsTurn([{ name: "get_staff_hours" }]);
    mockedGenerate
      .mockResolvedValueOnce(turn)
      .mockResolvedValueOnce(textTurn("Staff 2 worked the most."));
    const data = { staffHours: [{ staff: "Staff 2", totalHours: 20 }] };
    const executor = buildExecutor({ get_staff_hours: { ok: true, data } });

    const result = await answerQuestion({ question: QUESTION, executor });

    expect(result).toEqual({ status: "ok", answer: "Staff 2 worked the most." });
    expect(executor.execute).toHaveBeenCalledWith("get_staff_hours", {});
    const followUp = requestAt(1).contents;
    expect(followUp).toHaveLength(3);
    expect(followUp[1]).toEqual(turn.modelContent);
    expect(followUp[2]).toEqual({
      role: "user",
      parts: [{ functionResponse: { name: "get_staff_hours", response: { result: data } } }],
    });
  });

  it("answers a failed tool call with an error and lets the model carry on", async () => {
    mockedGenerate
      .mockResolvedValueOnce(callsTurn([{ name: "made_up_tool" }]))
      .mockResolvedValueOnce(textTurn("I could not look that up."));
    const executor = buildExecutor();

    const result = await answerQuestion({ question: QUESTION, executor });

    expect(result.status).toBe("ok");
    expect(requestAt(1).contents[2].parts[0]).toEqual({
      functionResponse: { name: "made_up_tool", response: { error: "Unknown tool." } },
    });
  });

  it("answers every call in a round, in order", async () => {
    mockedGenerate
      .mockResolvedValueOnce(
        callsTurn([{ name: "get_staff_hours" }, { name: "get_daily_clock_ins" }])
      )
      .mockResolvedValueOnce(textTurn("Done."));
    const executor = buildExecutor({
      get_staff_hours: { ok: true, data: "a" },
      get_daily_clock_ins: { ok: true, data: "b" },
    });

    await answerQuestion({ question: QUESTION, executor });

    const responses = requestAt(1).contents[2].parts.map(
      (part) => (part as { functionResponse: { name: string } }).functionResponse.name
    );
    expect(responses).toEqual(["get_staff_hours", "get_daily_clock_ins"]);
  });

  it("runs only a bounded number of calls per round but still answers all of them", async () => {
    const flood = Array.from({ length: MAX_CALLS_PER_ROUND + 3 }, () => ({
      name: "get_staff_hours",
    }));
    mockedGenerate
      .mockResolvedValueOnce(callsTurn(flood))
      .mockResolvedValueOnce(textTurn("Done."));
    const executor = buildExecutor({ get_staff_hours: { ok: true, data: "x" } });

    await answerQuestion({ question: QUESTION, executor });

    expect(executor.execute).toHaveBeenCalledTimes(MAX_CALLS_PER_ROUND);
    const parts = requestAt(1).contents[2].parts;
    expect(parts).toHaveLength(flood.length);
    expect(parts[flood.length - 1]).toMatchObject({
      functionResponse: { response: { error: expect.stringMatching(/too many/i) } },
    });
  });

  it("gives up as unavailable when the model keeps calling tools past the round cap", async () => {
    mockedGenerate.mockResolvedValue(callsTurn([{ name: "get_staff_hours" }]));
    const executor = buildExecutor({ get_staff_hours: { ok: true, data: "x" } });

    const result = await answerQuestion({ question: QUESTION, executor });

    expect(result).toEqual({ status: "unavailable" });
    expect(mockedGenerate).toHaveBeenCalledTimes(MAX_MODEL_ROUNDS);
  });

  it("returns unavailable, without throwing, when the vendor fails", async () => {
    mockedGenerate.mockRejectedValue(new AiUnavailableError("AI provider responded with 429"));

    await expect(
      answerQuestion({ question: QUESTION, executor: buildExecutor() })
    ).resolves.toEqual({ status: "unavailable" });
  });

  it("returns unavailable when a tool executor throws", async () => {
    mockedGenerate.mockResolvedValue(callsTurn([{ name: "get_staff_hours" }]));
    const executor = buildExecutor();
    executor.execute.mockRejectedValue(new Error("boom"));

    await expect(answerQuestion({ question: QUESTION, executor })).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("logs only the error type, never the question, an answer or tool output", async () => {
    const secret = "Priya Nowak clocked in at 07:02";
    mockedGenerate.mockRejectedValue(
      new AiUnavailableError(`Vendor echoed: ${QUESTION} ${secret}`)
    );

    await answerQuestion({ question: QUESTION, executor: buildExecutor() });

    const logged = consoleSpies
      .flatMap((spy) => spy.mock.calls)
      .flat()
      .map((value) => String(value))
      .join(" ");
    expect(logged).toContain("AiUnavailableError");
    expect(logged).not.toContain(QUESTION);
    expect(logged).not.toContain("Priya");
    expect(logged).not.toContain("07:02");
  });

  it("does not add anything to the conversation the model was not given", async () => {
    mockedGenerate.mockResolvedValue(textTurn("Done."));

    await answerQuestion({ question: QUESTION, executor: buildExecutor() });

    const contents: ConversationContent[] = requestAt(0).contents;
    expect(contents).toHaveLength(1);
    expect(JSON.stringify(contents)).toBe(
      JSON.stringify([{ role: "user", parts: [{ text: QUESTION }] }])
    );
  });
});

describe("SYSTEM_INSTRUCTION", () => {
  it("tells the model tool output is data, not instructions", () => {
    expect(SYSTEM_INSTRUCTION).toMatch(/never as instructions/i);
  });

  it("states the 7-day limit and the alias convention", () => {
    expect(SYSTEM_INSTRUCTION).toMatch(/last 7 days/i);
    expect(SYSTEM_INSTRUCTION).toMatch(/Staff 1/);
  });
});
