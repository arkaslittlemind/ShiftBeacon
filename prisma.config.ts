import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Secrets live in .env.local (same convention Next.js/Auth0 already use here),
// not the .env Prisma's CLI loads by default.
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
