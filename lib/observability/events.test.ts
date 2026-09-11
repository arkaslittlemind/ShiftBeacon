import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAnalyticsClient } from "./analytics";
import { captureServerEvent } from "./events";

vi.mock("./analytics", () => ({ getAnalyticsClient: vi.fn() }));

const capture = vi.fn();
const flush = vi.fn().mockResolvedValue(undefined);

const actor = {
  id: "cmtxblc5e0000w8a31fis64ip",
  role: "CARE_WORKER" as const,
  organizationId: "cmtxbrbtw000010a3ahz8or9f",
};

function lastCapture() {
  return capture.mock.calls.at(-1)?.[0];
}

describe("captureServerEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    flush.mockResolvedValue(undefined);
    vi.mocked(getAnalyticsClient).mockReturnValue({
      capture,
      flush,
    } as unknown as ReturnType<typeof getAnalyticsClient>);
  });

  it("identifies by the internal id and attaches role and organization", async () => {
    await captureServerEvent(actor, {
      name: "shift_clock_in_succeeded",
      hasNote: true,
    });

    expect(lastCapture()).toMatchObject({
      distinctId: actor.id,
      event: "shift_clock_in_succeeded",
      properties: {
        hasNote: true,
        role: "CARE_WORKER",
        organizationId: actor.organizationId,
      },
    });
  });

  it("sends a clock-in rejection with its reason", async () => {
    await captureServerEvent(actor, {
      name: "shift_clock_in_rejected",
      reason: "outside_perimeter",
    });

    expect(lastCapture()).toMatchObject({
      event: "shift_clock_in_rejected",
      properties: { reason: "outside_perimeter" },
    });
  });

  it("sends a workplace update as booleans, never the new values", async () => {
    await captureServerEvent(actor, {
      name: "workplace_configuration_updated",
      changedName: false,
      changedLocation: true,
      changedRadius: true,
    });

    const payload = JSON.stringify(lastCapture());
    expect(payload).toContain("workplace_configuration_updated");
    expect(payload).not.toMatch(/-?\d+\.\d{3,}/);
  });

  // The whole point of the typed taxonomy: nothing sensitive can ride along.
  it("never sends coordinates, notes, names, or emails", async () => {
    await captureServerEvent(actor, {
      name: "shift_clock_out_succeeded",
      hasNote: true,
    });

    const payload = JSON.stringify(lastCapture()).toLowerCase();
    for (const banned of [
      "latitude",
      "longitude",
      "note:",
      "email",
      "@",
      "auth0|",
    ]) {
      expect(payload).not.toContain(banned);
    }
  });

  it("flushes, so a frozen serverless function does not lose the event", async () => {
    await captureServerEvent(actor, {
      name: "shift_clock_out_succeeded",
      hasNote: false,
    });

    expect(flush).toHaveBeenCalled();
  });

  it("does nothing when analytics are unconfigured", async () => {
    vi.mocked(getAnalyticsClient).mockReturnValue(null);

    await expect(
      captureServerEvent(actor, {
        name: "shift_clock_in_succeeded",
        hasNote: false,
      })
    ).resolves.toBeUndefined();
    expect(capture).not.toHaveBeenCalled();
  });

  it("swallows a vendor failure rather than failing the request", async () => {
    capture.mockImplementationOnce(() => {
      throw new Error("posthog unreachable");
    });

    await expect(
      captureServerEvent(actor, {
        name: "shift_clock_in_succeeded",
        hasNote: false,
      })
    ).resolves.toBeUndefined();
  });

  // Building the client can throw on a malformed token or host, and that
  // happens before any capture call.
  it("swallows a failure to build the client at all", async () => {
    vi.mocked(getAnalyticsClient).mockImplementationOnce(() => {
      throw new Error("invalid posthog configuration");
    });

    await expect(
      captureServerEvent(actor, {
        name: "shift_clock_in_succeeded",
        hasNote: false,
      })
    ).resolves.toBeUndefined();
  });

  it("swallows a rejected flush too", async () => {
    flush.mockRejectedValueOnce(new Error("network down"));

    await expect(
      captureServerEvent(actor, {
        name: "shift_clock_in_succeeded",
        hasNote: false,
      })
    ).resolves.toBeUndefined();
  });
});
