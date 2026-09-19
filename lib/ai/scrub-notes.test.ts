import { describe, expect, it } from "vitest";
import { REDACTED_EMAIL, REDACTED_NAME, REDACTED_PHONE, scrubNote } from "./scrub-notes";

const roster = ["Tomas Nowak", "Priya Raman", "Ada Mensah"];

describe("scrubNote", () => {
  it("redacts a full roster name", () => {
    expect(scrubNote("Covering for Tomas Nowak this week.", roster)).toBe(
      `Covering for ${REDACTED_NAME} ${REDACTED_NAME} this week.`
    );
  });

  it("redacts a first or last name used on its own", () => {
    expect(scrubNote("Swapped with Priya.", roster)).toBe(
      `Swapped with ${REDACTED_NAME}.`
    );
    expect(scrubNote("Mensah took the late.", roster)).toBe(
      `${REDACTED_NAME} took the late.`
    );
  });

  it("redacts names regardless of case", () => {
    expect(scrubNote("handover from ADA and tomas", roster)).toBe(
      `handover from ${REDACTED_NAME} and ${REDACTED_NAME}`
    );
  });

  it("redacts possessive forms", () => {
    expect(scrubNote("Priya's notes are in the file.", roster)).toBe(
      `${REDACTED_NAME} notes are in the file.`
    );
    expect(scrubNote("Ada’s handover was thorough.", roster)).toBe(
      `${REDACTED_NAME} handover was thorough.`
    );
  });

  it("does not redact a roster name buried inside a longer word", () => {
    expect(scrubNote("The veranda door was left open.", roster)).toBe(
      "The veranda door was left open."
    );
  });

  it("redacts email addresses", () => {
    expect(scrubNote("Emailed facilities@example.com about the leak.", roster)).toBe(
      `Emailed ${REDACTED_EMAIL} about the leak.`
    );
  });

  it("redacts phone numbers", () => {
    expect(scrubNote("Call back on 07700 900312 please.", roster)).toBe(
      `Call back on ${REDACTED_PHONE} please.`
    );
    expect(scrubNote("Office line +44 20 7946 0958.", roster)).toBe(
      `Office line ${REDACTED_PHONE}.`
    );
  });

  // Care notes are full of small numbers. Redacting those would strip the
  // detail that makes a handover digest worth reading.
  it("leaves room numbers, times, and durations alone", () => {
    const note = "Room 4 hoist checked at 3am, meds ran 30 minutes late on 2026-09-17.";
    expect(scrubNote(note, roster)).toBe(note);
  });

  it("passes through a note with nothing to redact", () => {
    const note = "Quiet shift. Laundry backlog cleared before handover.";
    expect(scrubNote(note, roster)).toBe(note);
  });

  it("passes the note through unchanged when the roster is empty", () => {
    const note = "Covering for Tomas Nowak this week.";
    expect(scrubNote(note, [])).toBe(note);
  });

  it("still redacts emails and phone numbers with an empty roster", () => {
    expect(scrubNote("Reach me at a@b.co or 07700 900312.", [])).toBe(
      `Reach me at ${REDACTED_EMAIL} or ${REDACTED_PHONE}.`
    );
  });

  it("is idempotent", () => {
    const note = "Tomas Nowak emailed facilities@example.com from 07700 900312.";
    const once = scrubNote(note, roster);

    expect(scrubNote(once, roster)).toBe(once);
  });

  it("handles an empty note", () => {
    expect(scrubNote("", roster)).toBe("");
  });

  // A roster entry with a one or two letter token would otherwise match far
  // more than a name, so short tokens are deliberately skipped.
  it("ignores roster tokens too short to identify anyone", () => {
    expect(scrubNote("Al is on the rota at 9.", ["Al Bo"])).toBe(
      "Al is on the rota at 9."
    );
  });
});

// F-05: a roster name that is also an ordinary English word (Casey
// "Worker", Morgan "Manager") was being redacted every time the word
// appeared as prose, not just when it named someone.
describe("scrubNote - common-word roster names (F-05)", () => {
  const commonWordRoster = ["Casey Worker", "Morgan Manager"];

  it("leaves a lowercase common word alone, even though it is also a surname", () => {
    expect(
      scrubNote(
        "Covered by an agency worker for the shift.",
        commonWordRoster
      )
    ).toBe("Covered by an agency worker for the shift.");
  });

  it("leaves a lowercase common word alone mid-sentence for another roster entry", () => {
    expect(
      scrubNote("The manager reviewed the rota.", commonWordRoster)
    ).toBe("The manager reviewed the rota.");
  });

  it("still redacts a full name that pairs a distinctive token with a common-word surname", () => {
    expect(scrubNote("Casey Worker started the late.", commonWordRoster)).toBe(
      `${REDACTED_NAME} ${REDACTED_NAME} started the late.`
    );
  });

  it("still redacts a capitalised common-word token on its own", () => {
    expect(scrubNote("Worker covered the late.", commonWordRoster)).toBe(
      `${REDACTED_NAME} covered the late.`
    );
  });

  it("still redacts a distinctive token regardless of case, unaffected by the common-word list", () => {
    expect(scrubNote("covering for nowak", ["Tomas Nowak"])).toBe(
      `covering for ${REDACTED_NAME}`
    );
  });

  // The capitalised-only rule has to hold on its own terms, not merely
  // because real names happen to arrive title-cased. A roster entry stored
  // in a different case must not flip which form of the word gets caught.
  it("still matches the capitalised form even when the roster stores the name lowercase", () => {
    expect(
      scrubNote("Worker covered the late.", ["casey worker"])
    ).toBe(`${REDACTED_NAME} covered the late.`);
  });

  it("still leaves the lowercase word alone when the roster stores the name lowercase", () => {
    expect(
      scrubNote("Covered by an agency worker for the shift.", ["casey worker"])
    ).toBe("Covered by an agency worker for the shift.");
  });
});

describe("scrubNote - names with non-ASCII letters", () => {
  const roster = ["José García", "Zoë Lin", "Łukasz Nowak"];

  it("redacts an accented first name, which a plain word boundary cannot see", () => {
    expect(scrubNote("José covered the night.", roster)).toBe(
      `${REDACTED_NAME} covered the night.`
    );
  });

  it("redacts accented names in the middle of a sentence and with a possessive", () => {
    expect(scrubNote("Handover from Zoë, then Łukasz's rota.", roster)).toBe(
      `Handover from ${REDACTED_NAME}, then ${REDACTED_NAME} rota.`
    );
  });

  it("redacts an accented surname", () => {
    expect(scrubNote("Ask García about it.", roster)).toBe(`Ask ${REDACTED_NAME} about it.`);
  });

  it("matches regardless of case", () => {
    expect(scrubNote("JOSÉ was late.", roster)).toBe(`${REDACTED_NAME} was late.`);
  });

  it("does not redact an accented name buried inside a longer word", () => {
    expect(scrubNote("Josée was late.", roster)).toBe("Josée was late.");
  });
});
