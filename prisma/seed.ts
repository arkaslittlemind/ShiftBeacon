import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const organization = await prisma.organization.create({
    data: {
      name: "Riverside Care Home",
      latitude: 51.5074,
      longitude: -0.1278,
      clockInRadiusMeters: 200,
    },
  });

  await prisma.user.create({
    data: {
      auth0UserId: "auth0|seed-care-worker",
      name: "Casey Worker",
      email: "casey.worker@example.com",
      role: "CARE_WORKER",
      organizationId: organization.id,
    },
  });

  await prisma.user.create({
    data: {
      auth0UserId: "auth0|seed-manager",
      name: "Morgan Manager",
      email: "morgan.manager@example.com",
      role: "MANAGER",
      organizationId: organization.id,
    },
  });

  console.log(`Seeded organization "${organization.name}" with 2 users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
