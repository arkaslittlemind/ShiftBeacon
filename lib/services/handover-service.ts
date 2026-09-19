import { prisma } from "@/lib/prisma";
import { generateDigest } from "@/lib/ai/handover-digest";
import { scrubNote } from "@/lib/ai/scrub-notes";
import { errorTypeOnly } from "@/lib/redaction";
import { toUtcDateKey } from "@/lib/services/analytics-service";
import { MS_PER_DAY } from "@/lib/time";
import type { HandoverDigestResult } from "@/types/handover";

// Enough recent shifts to find the latest day that has a usable note, without
// reading an organization's whole history to answer one dashboard card.
const NOTE_CANDIDATE_LIMIT = 50;

type NoteRow = {
  clockInAt: Date;
  clockInNote: string | null;
  clockOutNote: string | null;
};

function reason(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function collectNotes(shifts: NoteRow[], roster: string[]): string[] {
  const notes: string[] = [];
  for (const shift of shifts) {
    for (const note of [shift.clockInNote, shift.clockOutNote]) {
      const trimmed = note?.trim();
      if (trimmed) {
        notes.push(scrubNote(trimmed, roster));
      }
    }
  }
  return notes;
}

// The one place a day's notes are read and scrubbed, shared by the digest and
// the attendance question tools so neither can send a note the other would have
// redacted.
export async function getScrubbedNotesForDay(
  organizationId: string,
  date: string
): Promise<string[]> {
  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(dayStart.getTime() + MS_PER_DAY);

  const [shifts, staff] = await Promise.all([
    prisma.shift.findMany({
      where: {
        organizationId,
        clockInAt: { gte: dayStart, lt: dayEnd },
      },
      select: { clockInAt: true, clockInNote: true, clockOutNote: true },
    }),
    prisma.user.findMany({
      where: { organizationId },
      select: { name: true },
    }),
  ]);

  return collectNotes(
    shifts,
    staff.map((member) => member.name)
  );
}

async function findLatestDayWithNotes(
  organizationId: string
): Promise<string | null> {
  const candidates = await prisma.shift.findMany({
    where: {
      organizationId,
      OR: [{ clockInNote: { not: null } }, { clockOutNote: { not: null } }],
    },
    orderBy: { clockInAt: "desc" },
    take: NOTE_CANDIDATE_LIMIT,
    select: { clockInAt: true, clockInNote: true, clockOutNote: true },
  });

  // The database can only test for null, so a note of pure whitespace passes
  // its filter and would otherwise win the day, hiding an older day that has
  // something real to say.
  const latest = candidates.find(
    (shift) => shift.clockInNote?.trim() || shift.clockOutNote?.trim()
  );

  return latest ? toUtcDateKey(latest.clockInAt) : null;
}

// Coalesces concurrent calls for the same organization/date within this
// process: two requests that both miss the cache before either has written it
// (two managers on the same dashboard, one manager with two tabs, a double
// navigation) would otherwise each spend a vendor call for what should be one
// digest, and free-tier quota is scarce enough that this matters in practice.
//
// This only helps within one warm process. On a platform that spins up
// separate instances for concurrent requests, two different instances can
// still both miss the cache and both generate - the map has no visibility
// across processes. Still a real improvement for the common case (a long-
// running server, or two requests landing on the same warm instance).
const inFlightDigests = new Map<string, Promise<HandoverDigestResult>>();

export function getHandoverDigest(
  organizationId: string,
  date: string
): Promise<HandoverDigestResult> {
  const key = `${organizationId}:${date}`;
  const existing = inFlightDigests.get(key);
  if (existing) {
    return existing;
  }

  const promise = loadOrGenerateDigest(organizationId, date).finally(() => {
    inFlightDigests.delete(key);
  });
  inFlightDigests.set(key, promise);
  return promise;
}

// Never throws. A vendor error, a schema violation, and a missing key all come
// back as "unavailable", so no caller can accidentally make the dashboard
// depend on the vendor being up.
async function loadOrGenerateDigest(
  organizationId: string,
  date: string
): Promise<HandoverDigestResult> {
  try {
    const cached = await prisma.handoverDigest.findUnique({
      where: { organizationId_date: { organizationId, date } },
    });
    if (cached) {
      return {
        status: "ok",
        date,
        digest: {
          summary: cached.summary,
          keyPoints: cached.keyPoints,
          flags: cached.flags,
        },
        generatedAt: cached.generatedAt,
      };
    }

    const notes = await getScrubbedNotesForDay(organizationId, date);
    if (notes.length === 0) {
      return { status: "empty" };
    }

    const digest = await generateDigest(notes, date);
    if (!digest) {
      return { status: "unavailable" };
    }

    // Only successes are cached. A vendor outage should clear on the next load,
    // not stick to the organization for the rest of the day.
    //
    // A failed cache write must not discard a digest we have already paid
    // quota for: the manager still gets it, we just pay again next time.
    let generatedAt = new Date();
    try {
      const stored = await prisma.handoverDigest.upsert({
        where: { organizationId_date: { organizationId, date } },
        update: { ...digest, generatedAt },
        create: { organizationId, date, ...digest },
      });
      generatedAt = stored.generatedAt;
    } catch (error) {
      // The cache write is the one place an error can echo digest text back at
      // us, because the row being written is the digest, so log its type only.
      // Every other path logs its message, which is what makes a failure
      // diagnosable.
      console.warn("[handover] could not cache the digest:", errorTypeOnly(error));
    }

    return { status: "ok", date, digest, generatedAt };
  } catch (error) {
    console.warn("[handover] digest generation failed:", reason(error));
    return { status: "unavailable" };
  }
}

// What the dashboard calls. Picks the most recent day that actually has notes
// rather than today: a dashboard opened in the morning has no completed shifts
// yet, so a hardcoded "today" would read as empty almost every time.
export async function getLatestHandoverDigest(
  organizationId: string
): Promise<HandoverDigestResult> {
  try {
    const date = await findLatestDayWithNotes(organizationId);
    if (!date) {
      return { status: "empty" };
    }
    return await getHandoverDigest(organizationId, date);
  } catch (error) {
    console.warn("[handover] could not find a day to digest:", reason(error));
    return { status: "unavailable" };
  }
}
