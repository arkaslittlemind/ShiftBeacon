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
