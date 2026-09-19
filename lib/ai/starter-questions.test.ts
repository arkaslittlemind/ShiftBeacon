import { describe, expect, it } from "vitest";
import { validateQuestion } from "@/lib/services/ask-service";
import { buildStarterQuestions } from "./starter-questions";

const NOW = new Date("2026-09-19T15:00:00.000Z");

describe("buildStarterQuestions", () => {
  it("returns four questions that the engine would accept", () => {
    const questions = buildStarterQuestions(NOW);

    expect(questions).toHaveLength(4);
    for (const question of questions) {
      expect(validateQuestion(question)).toEqual({ valid: true, question });
    }
  });

  it("names the UTC day before now in the notes question", () => {
    const notes = buildStarterQuestions(NOW).find((q) => q.includes("notes"));

    expect(notes).toContain("2026-09-18");
  });

  it("crosses a month and year boundary", () => {
    const notes = buildStarterQuestions(new Date("2026-01-01T00:30:00.000Z")).find(
      (q) => q.includes("notes")
    );

    expect(notes).toContain("2025-12-31");
  });

  it("uses the UTC day, not a local one, late in the day", () => {
    const notes = buildStarterQuestions(new Date("2026-09-19T23:59:59.000Z")).find(
      (q) => q.includes("notes")
    );

    expect(notes).toContain("2026-09-18");
  });

  it("carries no email, id or coordinate-like text", () => {
    for (const question of buildStarterQuestions(NOW)) {
      expect(question).not.toMatch(/@|\bu-|org-|\d+\.\d{3,}/);
    }
  });
});
