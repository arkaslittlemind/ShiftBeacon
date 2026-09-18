import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { MS_PER_DAY, MS_PER_HOUR } from "../lib/time";
import {
  SEED_ACTIVE_SHIFTS,
  SEED_ORGANIZATION,
  SEED_SHIFTS,
  SEED_USERS,
} from "./seed-data";

config({ path: ".env.local" });

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

// Analytics buckets shifts by UTC date key (lib/services/analytics-service.ts),
// so the seed has to place them on UTC day boundaries or the charts and the
// handover digest would disagree about which day a shift belongs to.
function utcDayStart(now: Date, daysAgo: number): number {
  const start = new Date(now.getTime() - daysAgo * MS_PER_DAY);
  start.setUTCHours(0, 0, 0, 0);
  return start.getTime();
}

// Spread clock-in points around the workplace by a few tens of metres, so the
// manager view shows variation rather than one repeated pin. Jitters around the
// organization's real coordinates, which a manager may have moved since.
function jitteredLocation(
  organization: { latitude: number; longitude: number },
  index: number
) {
  return {
    latitude: organization.latitude + ((index % 5) - 2) * 0.0002,
    longitude: organization.longitude + ((index % 3) - 1) * 0.0003,
  };
}

async function main() {
  const now = new Date();

  // Reuse whatever organization is already there rather than adding another.
  // findOrCreateCurrentUser attaches new Auth0 users to the first organization
  // it finds, so a second one would split real users away from the seed data.
  const existingOrganization = await prisma.organization.findFirst();
  const organization = existingOrganization
    ? await prisma.organization.update({
        where: { id: existingOrganization.id },
        data: { name: SEED_ORGANIZATION.name },
      })
    : await prisma.organization.create({ data: SEED_ORGANIZATION });

  const userIdByKey = new Map<string, string>();
  for (const seedUser of SEED_USERS) {
    const user = await prisma.user.upsert({
      where: { auth0UserId: seedUser.auth0UserId },
      update: {
        name: seedUser.name,
        email: seedUser.email,
        role: seedUser.role,
        organizationId: organization.id,
      },
      create: {
        auth0UserId: seedUser.auth0UserId,
        name: seedUser.name,
        email: seedUser.email,
        role: seedUser.role,
        organizationId: organization.id,
      },
    });
    userIdByKey.set(seedUser.key, user.id);
  }

  // Re-runnable: only shifts belonging to seeded users are cleared, so real
  // Auth0 accounts and their shift history are left alone.
  const seededUserIds = [...userIdByKey.values()];
  await prisma.shift.deleteMany({ where: { userId: { in: seededUserIds } } });

  // Cached digests are keyed by organization and day, so re-seeding with
  // edited notes would otherwise keep serving a summary of the old ones.
  await prisma.handoverDigest.deleteMany({
    where: { organizationId: organization.id },
  });

  let skipped = 0;
  const completed = SEED_SHIFTS.map((shift, index) => {
    const clockInAt = new Date(
      utcDayStart(now, shift.dayOffset) + shift.startHour * MS_PER_HOUR
    );
    const clockOutAt = new Date(clockInAt.getTime() + shift.hours * MS_PER_HOUR);
    const location = jitteredLocation(organization, index);

    return {
      userId: userIdByKey.get(shift.worker)!,
      organizationId: organization.id,
      clockInAt,
      clockInLatitude: location.latitude,
      clockInLongitude: location.longitude,
      clockInNote: shift.clockInNote ?? null,
      clockOutAt,
      clockOutLatitude: location.latitude,
      clockOutLongitude: location.longitude,
      clockOutNote: shift.clockOutNote ?? null,
    };
  }).filter((shift) => {
    // A night shift near the start of the window can land in the future when
    // the seed is run in the small hours. Seeding it would show the manager a
    // shift that has not happened yet.
    if (shift.clockOutAt.getTime() > now.getTime()) {
      skipped++;
      return false;
    }
    return true;
  });

  const active = SEED_ACTIVE_SHIFTS.map((shift, index) => {
    const location = jitteredLocation(organization, SEED_SHIFTS.length + index);
    return {
      userId: userIdByKey.get(shift.worker)!,
      organizationId: organization.id,
      clockInAt: new Date(now.getTime() - shift.hoursAgo * MS_PER_HOUR),
      clockInLatitude: location.latitude,
      clockInLongitude: location.longitude,
      clockInNote: shift.clockInNote ?? null,
    };
  });

  await prisma.shift.createMany({ data: [...completed, ...active] });

  console.log(
    `Seeded organization "${organization.name}" with ${SEED_USERS.length} users, ` +
      `${completed.length} completed shifts, and ${active.length} active shifts` +
      (skipped > 0 ? ` (${skipped} future-dated shifts skipped).` : ".")
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
