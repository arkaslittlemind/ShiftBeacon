import { describe, expect, it } from "vitest";
import { errorTypeOnly } from "./redaction";

describe("errorTypeOnly", () => {
  it("returns the error's type and none of its message", () => {
    class DigestWriteError extends Error {
      constructor() {
        super("could not write: Priya Nowak was late on the 4th");
        this.name = "DigestWriteError";
      }
    }

    const result = errorTypeOnly(new DigestWriteError());

    expect(result).toBe("DigestWriteError");
    expect(result).not.toContain("Priya");
  });

  it("does not echo a thrown string, which could be note text", () => {
    expect(errorTypeOnly("Priya Nowak clocked in late")).toBe("unknown error");
  });

  it("does not echo a thrown object", () => {
    expect(errorTypeOnly({ note: "Priya" })).toBe("unknown error");
  });
});
