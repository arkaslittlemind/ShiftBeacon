import { z } from "zod";

const envSchema = z.object({
  AUTH0_DOMAIN: z.string().min(1),
  AUTH0_CLIENT_ID: z.string().min(1),
  AUTH0_CLIENT_SECRET: z.string().min(1),
  AUTH0_SECRET: z.string().min(1),
  APP_BASE_URL: z.string().min(1),
  DATABASE_URL: z.string().min(1),

  // Observability config is optional on purpose. Losing error monitoring is an
  // acceptable degradation; refusing to boot because a monitoring tool is
  // unconfigured would take down clock-in, which is not.
  NEXT_PUBLIC_SENTRY_DSN: z.string().min(1).optional(),
  SENTRY_ORG: z.string().min(1).optional(),
  SENTRY_PROJECT: z.string().min(1).optional(),

  // NEXT_PUBLIC_ because feature 17b needs these in the browser; 17a reads
  // them server-side, which works the same way.
  NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const missing = result.error.issues.map((issue) => issue.path.join("."));
    throw new Error(
      `Missing or invalid environment variables: ${missing.join(", ")}`
    );
  }
  return result.data;
}

// Optional config can't fail the boot, so a production deploy missing its DSN
// would otherwise look healthy while silently reporting nothing.
export function observabilityWarnings(
  source: Record<string, string | undefined>
): string[] {
  if (source.NODE_ENV !== "production") {
    return [];
  }

  const warnings: string[] = [];
  if (!source.NEXT_PUBLIC_SENTRY_DSN) {
    warnings.push(
      "NEXT_PUBLIC_SENTRY_DSN is not set - error monitoring is disabled in production"
    );
  }
  if (!source.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
    warnings.push(
      "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is not set - product analytics are disabled in production"
    );
  }
  return warnings;
}

let cachedEnv: Env | undefined;

// Multiple entry points (instrumentation.ts for dev/start, lib/prisma.ts and
// lib/auth0.ts as a build-time safety net) each need validated env, so this
// memoizes the parse instead of repeating it per module.
export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = parseEnv(process.env);
  }
  return cachedEnv;
}
