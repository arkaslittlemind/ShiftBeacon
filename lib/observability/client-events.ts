import posthog from "posthog-js";
import { browserAnalyticsEnabled } from "./analytics-browser";
import { warnAnalyticsFailure } from "./warn";

export type ManagerView = "dashboard" | "staff_detail" | "workplace_settings";

// A closed union, matching ServerAnalyticsEvent: attaching a coordinate, a
// note, a name, or an email is a type error rather than something a reviewer
// has to catch.
export type ClientAnalyticsEvent =
  | { name: "manager_view_opened"; view: ManagerView }
  | { name: "workplace_settings_save_failed" };

// role and organizationId are already attached as person properties by
// identifyBrowserUser, so call sites never repeat them.
export function captureClientEvent(event: ClientAnalyticsEvent): void {
  if (!browserAnalyticsEnabled()) {
    return;
  }

  const { name, ...properties } = event;

  try {
    posthog.capture(name, properties);
  } catch (error) {
    warnAnalyticsFailure(`capture ${name}`, error);
  }
}
