import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,

  project: process.env.SENTRY_PROJECT,

  silent: !process.env.CI,

  // Wider upload so production stack traces resolve in client chunks too,
  // at the cost of some build time.
  widenClientFileUpload: true,

  webpack: {
    // Cron/uptime monitoring is out of scope for this feature, and the app has
    // no cron jobs to instrument.
    automaticVercelMonitors: false,

    treeshake: {
      removeDebugLogging: true,
    },
  },
});
