import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AVIF first, WebP for browsers without it. Keep the photographic sources as
  // JPG: the optimizer resizes and encodes those per device, but passes an AVIF
  // source through at full size, so phones would download the whole file.
  images: { formats: ["image/avif", "image/webp"] },
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
