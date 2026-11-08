import { describe, expect, it } from "vitest";
import { firstName, getInitials } from "./names";

describe("firstName", () => {
  it("returns the first token of a full name", () => {
    expect(firstName("Amara Mensah")).toBe("Amara");
  });

  it("returns a single name unchanged", () => {
    expect(firstName("Amara")).toBe("Amara");
  });

  it("ignores leading and repeated whitespace", () => {
    expect(firstName("   Amara    Mensah  ")).toBe("Amara");
  });

  it("returns an empty string for an empty or blank name", () => {
    expect(firstName("")).toBe("");
    expect(firstName("   ")).toBe("");
  });
});

describe("getInitials", () => {
  it("uses the first and last name", () => {
    expect(getInitials("Amara Grace Mensah")).toBe("AM");
  });

  it("uses the first two letters of a single name", () => {
    expect(getInitials("amara")).toBe("AM");
  });

  it("falls back to a question mark for an empty name", () => {
    expect(getInitials("  ")).toBe("?");
  });
});
