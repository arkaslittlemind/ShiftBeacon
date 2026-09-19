import { describe, expect, it } from "vitest";
import { aliasQuestion, createAliasMap, dealiasAnswer } from "./attendance-aliases";

const staff = [
  { id: "u-morgan", name: "Morgan Manager" },
  { id: "u-casey", name: "Casey Worker" },
  { id: "u-priya", name: "Priya Nowak" },
];

const map = createAliasMap(staff);

describe("createAliasMap", () => {
  it("assigns Staff 1..N in name order, whatever order the roster arrives in", () => {
    const shuffled = createAliasMap([staff[2], staff[0], staff[1]]);

    expect(shuffled.aliasForId("u-casey")).toBe("Staff 1");
    expect(shuffled.aliasForId("u-morgan")).toBe("Staff 2");
    expect(shuffled.aliasForId("u-priya")).toBe("Staff 3");
    expect(map.entries.map((entry) => entry.alias)).toEqual(["Staff 1", "Staff 2", "Staff 3"]);
  });

  it("returns undefined for an id that is not on the roster", () => {
    expect(map.aliasForId("someone-else")).toBeUndefined();
  });

  it("skips staff with an empty name instead of aliasing a blank", () => {
    const withBlank = createAliasMap([...staff, { id: "u-blank", name: "  " }]);

    expect(withBlank.aliasForId("u-blank")).toBeUndefined();
    expect(withBlank.entries).toHaveLength(3);
  });
});

describe("aliasQuestion", () => {
  it("replaces a full name with its alias, ignoring case", () => {
    expect(aliasQuestion("How many hours did priya nowak work?", map)).toBe(
      "How many hours did Staff 3 work?"
    );
  });

  it("keeps a possessive on the alias", () => {
    expect(aliasQuestion("What were Priya Nowak's hours?", map)).toBe(
      "What were Staff 3's hours?"
    );
  });

  it("replaces a first or last name that identifies exactly one person", () => {
    expect(aliasQuestion("Did Priya clock in today?", map)).toBe("Did Staff 3 clock in today?");
    expect(aliasQuestion("Did Nowak clock in today?", map)).toBe("Did Staff 3 clock in today?");
  });

  it("never guesses when a first name is shared: the bare name is redacted instead", () => {
    const shared = createAliasMap([
      { id: "a", name: "Casey Worker" },
      { id: "b", name: "Casey Nowak" },
    ]);

    const result = aliasQuestion("Was Casey late, or Casey Nowak?", shared);

    expect(result).toBe("Was [name] late, or Staff 1?");
  });

  it("aliases a full name that contains a common word, but redacts a bare capitalised one", () => {
    expect(aliasQuestion("Hours for Casey Worker?", map)).toBe("Hours for Staff 1?");
    expect(aliasQuestion("Hours for Worker?", map)).toBe("Hours for [name]?");
  });

  it("leaves ordinary lowercase uses of a common word alone", () => {
    expect(aliasQuestion("Did the agency worker cover nights?", map)).toBe(
      "Did the agency worker cover nights?"
    );
  });

  it("does not replace a name that is only part of a longer word", () => {
    expect(aliasQuestion("Any notes from Priyanka?", map)).toBe("Any notes from Priyanka?");
  });

  it("redacts an email without leaving an alias inside it", () => {
    const result = aliasQuestion("Email priya.nowak@example.com about Priya", map);

    expect(result).toBe("Email [email] about Staff 3");
  });

  it("redacts a phone number", () => {
    expect(aliasQuestion("Call 07700 900123 about Priya", map)).toBe(
      "Call [phone] about Staff 3"
    );
  });

  it("leaves a question with no names untouched", () => {
    const question = "What was the average hours per day this week?";

    expect(aliasQuestion(question, map)).toBe(question);
  });

  it("leaves no roster name behind in any of these questions", () => {
    const questions = [
      "How many hours did Casey Worker do versus Morgan Manager?",
      "Was priya nowak's shift longer than CASEY's?",
      "Anything from Morgan or Nowak this week?",
    ];

    for (const question of questions) {
      const aliased = aliasQuestion(question, map).toLowerCase();
      for (const { name } of staff) {
        for (const token of name.toLowerCase().split(" ")) {
          expect(aliased).not.toContain(token);
        }
      }
    }
  });
});

describe("dealiasAnswer", () => {
  it("maps an alias back to the real name", () => {
    expect(dealiasAnswer("Staff 3 worked the most hours.", map)).toBe(
      "Priya Nowak worked the most hours."
    );
  });

  it("keeps a possessive and maps several aliases in one answer", () => {
    expect(dealiasAnswer("Staff 1's total beat Staff 2's.", map)).toBe(
      "Casey Worker's total beat Morgan Manager's."
    );
  });

  it("does not confuse Staff 1 with Staff 12", () => {
    const large = createAliasMap(
      Array.from({ length: 12 }, (_, index) => ({
        id: `u${index}`,
        name: `Person${String(index).padStart(2, "0")} Surname`,
      }))
    );

    expect(dealiasAnswer("Staff 12 and Staff 1", large)).toBe(
      "Person11 Surname and Person00 Surname"
    );
  });

  it("leaves an alias the model invented untouched", () => {
    expect(dealiasAnswer("Staff 99 was on shift.", map)).toBe("Staff 99 was on shift.");
  });

  it("does not touch the word staff when no number follows", () => {
    expect(dealiasAnswer("Staff members clocked in 12 times.", map)).toBe(
      "Staff members clocked in 12 times."
    );
  });
});
