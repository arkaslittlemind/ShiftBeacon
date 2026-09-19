import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

vi.mock("@/lib/services/staff-service", () => ({
  getRosterForOrganization: vi.fn(),
}));

vi.mock("@/lib/ai/attendance-tools", () => ({
  createAttendanceTools: vi.fn(() => ({ declarations: [], execute: vi.fn() })),
}));

vi.mock("@/lib/ai/attendance-question", () => ({
  answerQuestion: vi.fn(),
}));

import { answerQuestion } from "@/lib/ai/attendance-question";
import { createAttendanceTools } from "@/lib/ai/attendance-tools";
import { getRosterForOrganization } from "@/lib/services/staff-service";
import { QUESTION_MAX_LENGTH } from "@/types/ask";
import { askAttendanceQuestion } from "./ask-service";

const mockedRoster = vi.mocked(getRosterForOrganization);
const mockedTools = vi.mocked(createAttendanceTools);
const mockedAnswer = vi.mocked(answerQuestion);

const user = { organizationId: "org-session" };

const roster = [
  { id: "u-casey", name: "Casey Worker" },
  { id: "u-priya", name: "Priya Nowak" },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  mockedRoster.mockResolvedValue(roster);
  mockedAnswer.mockResolvedValue({ status: "ok", answer: "Nobody worked more than 8 hours." });
});

describe("askAttendanceQuestion", () => {
  it("rejects an empty or whitespace-only question without reaching the vendor", async () => {
    for (const question of ["", "   ", "\n\t"]) {
      const result = await askAttendanceQuestion(user, question);
      expect(result.status).toBe("invalid");
    }
    expect(mockedRoster).not.toHaveBeenCalled();
    expect(mockedAnswer).not.toHaveBeenCalled();
  });

  it("accepts a question of exactly the maximum length and rejects one character more", async () => {
    const atLimit = "a".repeat(QUESTION_MAX_LENGTH);

    expect((await askAttendanceQuestion(user, atLimit)).status).toBe("ok");

    mockedAnswer.mockClear();
    const tooLong = await askAttendanceQuestion(user, "a".repeat(QUESTION_MAX_LENGTH + 1));
    expect(tooLong.status).toBe("invalid");
    expect(mockedAnswer).not.toHaveBeenCalled();
  });

  it("measures the question after trimming", async () => {
    const padded = `  ${"a".repeat(QUESTION_MAX_LENGTH)}  `;

    expect((await askAttendanceQuestion(user, padded)).status).toBe("ok");
  });

  it("explains an invalid question in words the manager can act on", async () => {
    const result = await askAttendanceQuestion(user, "");

    expect(result.status === "invalid" && result.reason.length > 0).toBe(true);
  });

  it("takes the organization from the user for both the roster and the tools", async () => {
    await askAttendanceQuestion(user, "How many hours this week?");

    expect(mockedRoster).toHaveBeenCalledWith("org-session");
    expect(mockedTools).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: "org-session" })
    );
  });

  it("hands the engine a question with no roster name in it", async () => {
    await askAttendanceQuestion(user, "Did Priya Nowak work more than Casey?");

    const handed = mockedAnswer.mock.calls[0][0].question;
    expect(handed).toBe("Did Staff 2 work more than Staff 1?");
    expect(handed).not.toMatch(/priya|nowak|casey|worker/i);
  });

  it("maps the model's aliases back to real names in the answer", async () => {
    mockedAnswer.mockResolvedValue({ status: "ok", answer: "Staff 2 worked the most." });

    const result = await askAttendanceQuestion(user, "Who worked the most?");

    expect(result).toEqual({ status: "ok", answer: "Priya Nowak worked the most." });
  });

  it("leaves an alias the model made up as it is", async () => {
    mockedAnswer.mockResolvedValue({ status: "ok", answer: "Staff 40 was on shift." });

    const result = await askAttendanceQuestion(user, "Who was on shift?");

    expect(result).toEqual({ status: "ok", answer: "Staff 40 was on shift." });
  });

  it("passes an engine failure through as unavailable", async () => {
    mockedAnswer.mockResolvedValue({ status: "unavailable" });

    await expect(askAttendanceQuestion(user, "Anything?")).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("returns unavailable instead of throwing when the roster cannot be read", async () => {
    mockedRoster.mockRejectedValue(new Error("connection to db.internal refused"));

    await expect(askAttendanceQuestion(user, "Anything?")).resolves.toEqual({
      status: "unavailable",
    });
    expect(mockedAnswer).not.toHaveBeenCalled();
  });

  it("logs only the error type when something fails", async () => {
    const warn = vi.spyOn(console, "warn");
    mockedRoster.mockRejectedValue(new Error("Priya Nowak asked about db.internal"));

    await askAttendanceQuestion(user, "Did Priya Nowak clock in?");

    const logged = warn.mock.calls.flat().map(String).join(" ");
    expect(logged).toContain("Error");
    expect(logged).not.toMatch(/priya|db\.internal/i);
  });
});
