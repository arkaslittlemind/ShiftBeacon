import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

async function main() {
  const { prisma } = await import("@/lib/prisma");
  const [, , command, ...args] = process.argv;

  try {
    if (command === "reset-shifts") {
      await prisma.shift.deleteMany({ where: { user: { email: { in: args } } } });
      return;
    }

    if (command === "get-workplace") {
      const organization = await prisma.organization.findFirst();
      if (!organization) {
        throw new Error("No Organization row found - run `npx tsx prisma/seed.ts` before the e2e suite.");
      }
      process.stdout.write(
        JSON.stringify({
          name: organization.name,
          latitude: organization.latitude,
          longitude: organization.longitude,
          clockInRadiusMeters: organization.clockInRadiusMeters,
        })
      );
      return;
    }

    throw new Error(`Unknown db-runner command: ${command}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
