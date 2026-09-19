import { describe, expect, it } from "vitest";
import { hashQuestion, normalizeQuestion } from "./normalize-question";

describe("normalizeQuestion", () => {
  it("ignores case, surrounding whitespace and inner whitespace runs", () => {
    expect(normalizeQuestion("  Who   worked\tthe MOST hours?  ")).toBe(
      "who worked the most hours"
    );
  });

  it("drops trailing question marks, full stops and exclamation marks", () => {
    expect(normalizeQuestion("How many clock-ins yesterday?!")).toBe("how many clock-ins yesterday");
    expect(normalizeQuestion("How many clock-ins yesterday ...")).toBe("how many clock-ins yesterday");
  });

  it("keeps punctuation inside the question", () => {
    expect(normalizeQuestion("Who worked 8.5 hours, or more?")).toBe("who worked 8.5 hours, or more");
  });

  it("folds compatibility characters", () => {
    expect(normalizeQuestion("ＷＨＯ worked most")).toBe("who worked most");
  });

  it("returns an empty string for empty or punctuation-only input", () => {
    expect(normalizeQuestion("")).toBe("");
    expect(normalizeQuestion("  ?!  ")).toBe("");
  });
});

describe("hashQuestion", () => {
  it("maps case, whitespace and a trailing question mark to one hash", () => {
    const base = hashQuestion("Who worked the most hours?");

    expect(hashQuestion("who worked the most hours")).toBe(base);
    expect(hashQuestion("  WHO  worked   the most hours ?")).toBe(base);
  });

  it("gives different questions, and the same question in other words, different hashes", () => {
    expect(hashQuestion("Who worked the most hours?")).not.toBe(
      hashQuestion("Who worked the fewest hours?")
    );
    expect(hashQuestion("Who worked the most hours?")).not.toBe(
      hashQuestion("Which person has the highest total hours?")
    );
  });

  it("hashes empty and punctuation-only input without throwing", () => {
    expect(hashQuestion("")).toBe(hashQuestion("?!"));
    expect(hashQuestion("")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is 64 hex characters and does not contain the question", () => {
    const hash = hashQuestion("How many hours did Priya Nowak work?");

    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain("priya");
  });
});
