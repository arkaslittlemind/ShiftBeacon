import posthog, { type PostHogConfig } from "posthog-js";
import type { ObservabilityActor } from "./actor";
import { warnAnalyticsFailure } from "./warn";

// Production-only and token-gated, matching sentryEnabled in sentry-options.ts.
// Read from process.env rather than getEnv(): these are NEXT_PUBLIC_, so Next
// inlines them into the browser bundle, and getEnv() would drag server-only
// required config into client code.
export function browserAnalyticsEnabled(): boolean {
  return process.env.NODE_ENV === "production" && Boolean(projectToken());
}

function projectToken(): string | undefined {
  return process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
}

// Every default that could collect something no one named in code is turned
// off here explicitly, rather than through posthog-js's `defaults` key: under
// recent defaults autocapture is on and capture_pageview becomes
// "history_change", so a dependency bump could otherwise start sending click
// and URL data for a healthcare app that stores worker coordinates.
export function browserAnalyticsOptions(): Partial<PostHogConfig> {
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  return {
    ...(host ? { api_host: host } : {}),
    autocapture: false,
    disable_session_recording: true,
    capture_pageview: false,
    capture_pageleave: false,
    // Anonymous visitors on the marketing pages never become person profiles.
    person_profiles: "identified_only",
  };
}

export function initBrowserAnalytics(): void {
  if (!browserAnalyticsEnabled()) {
    return;
  }

  const token = projectToken();
  if (!token) {
    return;
  }

  try {
    posthog.init(token, browserAnalyticsOptions());
  } catch (error) {
    warnAnalyticsFailure("browser init", error);
  }
}

// Role and organizationId ride along as person properties so every browser
// event carries the same two properties captureServerEvent attaches, without
// each call site repeating them.
export function identifyBrowserUser(actor: ObservabilityActor): void {
  if (!browserAnalyticsEnabled()) {
    return;
  }

  try {
    posthog.identify(actor.id, {
      role: actor.role,
      organizationId: actor.organizationId,
    });
  } catch (error) {
    warnAnalyticsFailure("browser identify", error);
  }
}

// Care workers share devices, so without this the next person to sign in on
// the same tablet inherits the previous worker's distinct_id.
export function resetBrowserAnalytics(): void {
  if (!browserAnalyticsEnabled()) {
    return;
  }

  try {
    posthog.reset();
  } catch (error) {
    warnAnalyticsFailure("browser reset", error);
  }
}
