import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    shift: { findMany: vi.fn() },
    user: { findMany: vi.fn() },
    handoverDigest: { findUnique: vi.fn(), upsert: vi.fn() },
  },
}));

vi.mock("@/lib/ai/client", () => ({
  generateJson: vi.fn(),
  isAiConfigured: vi.fn(),
  // Real class, not a stub: the service uses instanceof to decide whether an
  // error message is safe to log.
  AiUnavailableError: class AiUnavailableError extends Error {},
}));

import type {
  HandoverDigest as HandoverDigestRow,
  Shift,
  User,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { generateJson, isAiConfigured } from "@/lib/ai/client";
import { getHandoverDigest, getLatestHandoverDigest } from "./handover-service";

const mockedShiftFindMany = vi.mocked(prisma.shift.findMany);
const mockedUserFindMany = vi.mocked(prisma.user.findMany);
const mockedGenerateJson = vi.mocked(generateJson);
const mockedIsAiConfigured = vi.mocked(isAiConfigured);
const mockedDigestFindUnique = vi.mocked(prisma.handoverDigest.findUnique);
const mockedDigestUpsert = vi.mocked(prisma.handoverDigest.upsert);

const DATE = "2026-09-17";

function shift(overrides: Partial<Shift>): Shift {
  return {
    id: "shift1",
    userId: "user1",
    organizationId: "org1",
    clockInAt: new Date("2026-09-17T07:00:00Z"),
    clockInLatitude: 51.5074,
    clockInLongitude: -0.1278,
    clockInNote: null,
    clockOutAt: new Date("2026-09-17T15:00:00Z"),
    clockOutLatitude: 51.5074,
    clockOutLongitude: -0.1278,
    clockOutNote: null,
    createdAt: new Date("2026-09-17T07:00:00Z"),
    updatedAt: new Date("2026-09-17T15:00:00Z"),
    ...overrides,
  };
}

const tomas: User = {
  id: "user1",
  auth0UserId: "auth0|user1",
  name: "Tomas Nowak",
  email: "tomas.nowak@example.com",
  role: "CARE_WORKER",
  organizationId: "org1",
  createdAt: new Date("2026-09-01T00:00:00Z"),
  updatedAt: new Date("2026-09-01T00:00:00Z"),
};

const shiftsWithNotes = [
  shift({
    clockInNote: "Covering for Tomas Nowak.",
    clockOutNote: "Hoist in room 4 is grinding, logged with maintenance.",
  }),
];

const wellFormedDigest = {
  summary: "A steady day with one equipment fault.",
  keyPoints: ["Hoist in room 4 is grinding and has been logged."],
  flags: ["Maintenance follow-up needed on the room 4 hoist."],
};

function givenShifts(shifts: Shift[]) {
  mockedShiftFindMany.mockResolvedValue(shifts);
  mockedUserFindMany.mockResolvedValue([tomas]);
}

function digestRow(overrides: Partial<HandoverDigestRow> = {}): HandoverDigestRow {
  return {
    id: "digest1",
    organizationId: "org1",
    date: DATE,
    summary: wellFormedDigest.summary,
    keyPoints: wellFormedDigest.keyPoints,
    flags: wellFormedDigest.flags,
    generatedAt: new Date("2026-09-18T06:00:00Z"),
    ...overrides,
  };
}

// Shared baseline for every describe block below: a fresh mock slate, a
// configured vendor, and an empty cache. Callers that want a well-formed
// generation ready to go layer givenShifts + mockedGenerateJson on top.
function resetHandoverMocks() {
  vi.clearAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  mockedIsAiConfigured.mockReturnValue(true);
  mockedDigestFindUnique.mockResolvedValue(null);
  mockedDigestUpsert.mockResolvedValue(digestRow());
}

describe("getHandoverDigest", () => {
  beforeEach(resetHandoverMocks);

  it("returns the validated digest for a well-formed response", async () => {
    givenShifts(shiftsWithNotes);
    mockedGenerateJson.mockResolvedValue(wellFormedDigest);

    const result = await getHandoverDigest("org1", DATE);

    expect(result).toMatchObject({
      status: "ok",
      date: DATE,
      digest: wellFormedDigest,
    });
  });

  // The vendor is Category 2: scrubbed note text only. A staff name reaching
  // the prompt is a privacy incident, not a formatting bug.
  it("scrubs staff names out of the notes before they reach the vendor", async () => {
    givenShifts(shiftsWithNotes);
    mockedGenerateJson.mockResolvedValue(wellFormedDigest);

    await getHandoverDigest("org1", DATE);

    const prompt = mockedGenerateJson.mock.calls[0][0].prompt;
    expect(prompt).not.toMatch(/Tomas/i);
    expect(prompt).not.toMatch(/Nowak/i);
    expect(prompt).toMatch(/hoist in room 4/i);
  });

  it("reports unavailable when the response does not match the schema", async () => {
    givenShifts(shiftsWithNotes);
    mockedGenerateJson.mockResolvedValue({ summary: "Fine.", keyPoints: "not a list" });

    await expect(getHandoverDigest("org1", DATE)).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("reports unavailable when the vendor throws, without rethrowing", async () => {
    givenShifts(shiftsWithNotes);
    mockedGenerateJson.mockRejectedValue(new Error("429 rate limited"));

    await expect(getHandoverDigest("org1", DATE)).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("reports unavailable without calling the vendor when no key is configured", async () => {
    givenShifts(shiftsWithNotes);
    mockedIsAiConfigured.mockReturnValue(false);

    await expect(getHandoverDigest("org1", DATE)).resolves.toEqual({
      status: "unavailable",
    });
    expect(mockedGenerateJson).not.toHaveBeenCalled();
  });

  it("reports unavailable when the database read fails", async () => {
    mockedShiftFindMany.mockRejectedValue(new Error("connection lost"));
    mockedUserFindMany.mockResolvedValue([]);

    await expect(getHandoverDigest("org1", DATE)).resolves.toEqual({
      status: "unavailable",
    });
  });

  // Sentry turns console output into breadcrumbs, and a failed cache write can
  // echo the row it tried to write. That row is digest text derived from notes,
  // which Sentry may never receive.
  it("keeps note-derived text out of the log line when the cache write fails", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    givenShifts(shiftsWithNotes);
    mockedGenerateJson.mockResolvedValue(wellFormedDigest);
    mockedDigestUpsert.mockRejectedValue(
      new Error('insert failed: summary="Hoist in room 4 is grinding"')
    );

    await getHandoverDigest("org1", DATE);

    // Proves the run actually reached the cache write, so this is not passing
    // simply because it bailed out earlier.
    expect(mockedDigestUpsert).toHaveBeenCalled();
    expect(warn.mock.calls.flat().join(" ")).not.toMatch(/hoist/i);
  });

  // Quota is the scarce resource. Having paid for a digest, a failure to cache
  // it is not a reason to throw it away.
  it("still returns the digest when the cache write fails", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    givenShifts(shiftsWithNotes);
    mockedGenerateJson.mockResolvedValue(wellFormedDigest);
    mockedDigestUpsert.mockRejectedValue(new Error("connection lost"));

    await expect(getHandoverDigest("org1", DATE)).resolves.toMatchObject({
      status: "ok",
      digest: wellFormedDigest,
    });
  });

  it("reports empty when the day has no shifts at all", async () => {
    givenShifts([]);

    await expect(getHandoverDigest("org1", DATE)).resolves.toEqual({
      status: "empty",
    });
    expect(mockedGenerateJson).not.toHaveBeenCalled();
  });

  it("reports empty when the day's shifts carry only blank notes", async () => {
    givenShifts([shift({ clockOutNote: "   " })]);

    await expect(getHandoverDigest("org1", DATE)).resolves.toEqual({
      status: "empty",
    });
  });

  it("asks the database for that UTC day only", async () => {
    givenShifts(shiftsWithNotes);
    mockedGenerateJson.mockResolvedValue(wellFormedDigest);

    await getHandoverDigest("org1", DATE);

    const where = mockedShiftFindMany.mock.calls[0][0]!.where!;
    expect(where.organizationId).toBe("org1");
    expect(where.clockInAt).toEqual({
      gte: new Date("2026-09-17T00:00:00.000Z"),
      lt: new Date("2026-09-18T00:00:00.000Z"),
    });
  });
});

describe("getHandoverDigest caching", () => {
  beforeEach(() => {
    resetHandoverMocks();
    givenShifts(shiftsWithNotes);
    mockedGenerateJson.mockResolvedValue(wellFormedDigest);
  });

  it("stores the digest after generating it", async () => {
    await getHandoverDigest("org1", DATE);

    expect(mockedDigestUpsert).toHaveBeenCalledTimes(1);
    expect(mockedDigestUpsert.mock.calls[0][0].create).toMatchObject({
      organizationId: "org1",
      date: DATE,
      summary: wellFormedDigest.summary,
    });
  });

  // The whole point of the cache: free-tier quota is the scarce resource, and
  // a manager refreshing the dashboard must not spend it twice.
  it("serves a second load from the cache without calling the vendor", async () => {
    await getHandoverDigest("org1", DATE);
    mockedDigestFindUnique.mockResolvedValue(digestRow());

    const second = await getHandoverDigest("org1", DATE);

    expect(mockedGenerateJson).toHaveBeenCalledTimes(1);
    expect(second).toEqual({
      status: "ok",
      date: DATE,
      digest: wellFormedDigest,
      generatedAt: new Date("2026-09-18T06:00:00Z"),
    });
  });

  it("reports when the digest was generated, not when it was read", async () => {
    mockedDigestFindUnique.mockResolvedValue(
      digestRow({ generatedAt: new Date("2026-09-17T23:59:00Z") })
    );

    const result = await getHandoverDigest("org1", DATE);

    expect(result).toMatchObject({ generatedAt: new Date("2026-09-17T23:59:00Z") });
  });

  // A vendor outage that stuck to the organization for the rest of the day
  // would turn a blip into an all-day empty card.
  it("does not cache an unavailable result", async () => {
    mockedGenerateJson.mockRejectedValue(new Error("503"));

    await getHandoverDigest("org1", DATE);

    expect(mockedDigestUpsert).not.toHaveBeenCalled();
  });

  it("keeps each organization's cache separate", async () => {
    await getHandoverDigest("org2", DATE);

    expect(mockedDigestFindUnique.mock.calls[0][0].where).toEqual({
      organizationId_date: { organizationId: "org2", date: DATE },
    });
  });
});

// F-06: genuine concurrency (Promise.all, no intermediate await), unlike the
// caching describe block above, which only ever awaits the first call to
// finish before starting the second.
describe("getHandoverDigest concurrency (F-06)", () => {
  beforeEach(() => {
    resetHandoverMocks();
    givenShifts(shiftsWithNotes);
    mockedGenerateJson.mockResolvedValue(wellFormedDigest);
  });

  it("coalesces two concurrent calls for the same organization and date into one vendor call", async () => {
    const [first, second] = await Promise.all([
      getHandoverDigest("org1", DATE),
      getHandoverDigest("org1", DATE),
    ]);

    expect(mockedGenerateJson).toHaveBeenCalledTimes(1);
    expect(mockedDigestUpsert).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
    expect(first).toMatchObject({ status: "ok", digest: wellFormedDigest });
  });

  it("does not coalesce concurrent calls for different dates on the same organization", async () => {
    await Promise.all([
      getHandoverDigest("org1", "2026-09-17"),
      getHandoverDigest("org1", "2026-09-16"),
    ]);

    expect(mockedGenerateJson).toHaveBeenCalledTimes(2);
  });

  it("does not coalesce concurrent calls for different organizations on the same date", async () => {
    await Promise.all([
      getHandoverDigest("org1", DATE),
      getHandoverDigest("org2", DATE),
    ]);

    expect(mockedGenerateJson).toHaveBeenCalledTimes(2);
  });

  // The in-flight entry must clear once settled, or a later call for the same
  // key would keep reusing a stale promise instead of reading what the cache
  // actually holds by then.
  it("reads the persisted cache on a later call rather than reusing a stale in-flight promise", async () => {
    await getHandoverDigest("org1", DATE);
    mockedDigestFindUnique.mockResolvedValue(
      digestRow({ generatedAt: new Date("2026-09-18T09:00:00Z") })
    );

    const second = await getHandoverDigest("org1", DATE);

    expect(mockedGenerateJson).toHaveBeenCalledTimes(1);
    expect(second).toMatchObject({ generatedAt: new Date("2026-09-18T09:00:00Z") });
  });
});

describe("getLatestHandoverDigest", () => {
  // The first shift.findMany call picks the day; the second loads that day.
  function givenCandidatesThenDay(candidates: Shift[], day: Shift[]) {
    mockedShiftFindMany.mockResolvedValueOnce(candidates).mockResolvedValue(day);
    mockedUserFindMany.mockResolvedValue([tomas]);
  }

  beforeEach(() => {
    resetHandoverMocks();
    mockedGenerateJson.mockResolvedValue(wellFormedDigest);
  });

  // Not "today": a dashboard opened in the morning has no completed shifts
  // yet, so a hardcoded today would read as empty almost every time.
  it("digests the day of the most recent shift carrying a note", async () => {
    givenCandidatesThenDay(
      [
        shift({
          clockInAt: new Date("2026-09-17T22:30:00Z"),
          clockOutNote: "Settled night.",
        }),
      ],
      shiftsWithNotes
    );

    await expect(getLatestHandoverDigest("org1")).resolves.toMatchObject({
      status: "ok",
      date: "2026-09-17",
    });
  });

  // The database filter can only test for null, so a whitespace-only note
  // would otherwise win the day and hide an older day that has something real.
  it("skips a more recent day whose notes are only whitespace", async () => {
    givenCandidatesThenDay(
      [
        shift({ clockInAt: new Date("2026-09-18T07:00:00Z"), clockOutNote: "   " }),
        shift({
          clockInAt: new Date("2026-09-17T07:00:00Z"),
          clockOutNote: "Hoist in room 4 is grinding.",
        }),
      ],
      shiftsWithNotes
    );

    await expect(getLatestHandoverDigest("org1")).resolves.toMatchObject({
      status: "ok",
      date: "2026-09-17",
    });
  });

  it("reports empty when the organization has no notes at all", async () => {
    givenCandidatesThenDay([], []);

    await expect(getLatestHandoverDigest("org1")).resolves.toEqual({
      status: "empty",
    });
    expect(mockedGenerateJson).not.toHaveBeenCalled();
  });

  it("reports unavailable rather than throwing when the lookup fails", async () => {
    mockedShiftFindMany.mockRejectedValue(new Error("connection lost"));
    mockedUserFindMany.mockResolvedValue([tomas]);

    await expect(getLatestHandoverDigest("org1")).resolves.toEqual({
      status: "unavailable",
    });
  });
});
