import type { ObservabilityActor } from "./actor";
import { getAnalyticsClient } from "./analytics";
import { warnAnalyticsFailure } from "./warn";

export type ClockInRejectionReason =
  | "outside_perimeter"
  | "active_shift_exists";

// A closed union of the only shapes that can reach PostHog. Attaching a
// coordinate, a note, or an email is a type error rather than something a
// reviewer has to catch.
export type ServerAnalyticsEvent =
  | { name: "shift_clock_in_succeeded"; hasNote: boolean }
  | { name: "shift_clock_in_rejected"; reason: ClockInRejectionReason }
  | { name: "shift_clock_out_succeeded"; hasNote: boolean }
  | {
      name: "workplace_configuration_updated";
      changedName: boolean;
      changedLocation: boolean;
      changedRadius: boolean;
    };

export async function captureServerEvent(
  actor: ObservabilityActor,
  event: ServerAnalyticsEvent
): Promise<void> {
  const { name, ...properties } = event;

  // Everything is inside the try, including building the client: a malformed
  // token makes the constructor itself throw, and this runs in after(), where
  // a rejection would surface unhandled.
  try {
    const client = getAnalyticsClient();
    if (!client) {
      return;
    }

    client.capture({
      distinctId: actor.id,
      event: name,
      properties: {
        ...properties,
        role: actor.role,
        organizationId: actor.organizationId,
      },
    });
    await client.flush();
  } catch (error) {
    warnAnalyticsFailure(`capture ${name}`, error);
  }
}
