import { describe, expect, it } from "vitest";
import type { Event } from "@sentry/nextjs";
import { REDACTED, scrubSentryEvent } from "./scrub";

describe("scrubSentryEvent", () => {
  it("redacts coordinates in a request body", () => {
    const event: Event = {
      request: {
        method: "POST",
        data: { latitude: 51.5074, longitude: -0.1278, note: "on the ward" },
      },
    };

    const scrubbed = scrubSentryEvent(event);
    const data = scrubbed.request?.data as Record<string, unknown>;

    expect(data.latitude).toBe(REDACTED);
    expect(data.longitude).toBe(REDACTED);
    expect(data.note).toBe(REDACTED);
  });

  it("strips the query string from a request URL", () => {
    const event: Event = {
      request: {
        url: "https://shiftbeacon.app/api/shifts/clock-in?latitude=51.5&longitude=-0.12",
        query_string: "latitude=51.5&longitude=-0.12",
      },
    };

    const scrubbed = scrubSentryEvent(event);

    expect(scrubbed.request?.url).toBe(
      "https://shiftbeacon.app/api/shifts/clock-in"
    );
    expect(scrubbed.request?.url).not.toContain("51.5");
    expect(scrubbed.request?.query_string).toBe(REDACTED);
  });

  it("redacts coordinates carried in a breadcrumb", () => {
    const event: Event = {
      breadcrumbs: [
        {
          category: "fetch",
          data: { clockInLatitude: 51.5074, clockInLongitude: -0.1278 },
        },
      ],
    };

    const scrubbed = scrubSentryEvent(event);
    const data = scrubbed.breadcrumbs?.[0]?.data as Record<string, unknown>;

    expect(data.clockInLatitude).toBe(REDACTED);
    expect(data.clockInLongitude).toBe(REDACTED);
  });

  it("redacts the distance from the workplace", () => {
    const event: Event = {
      extra: { distanceMeters: 4821.7, routeName: "POST /api/shifts/clock-in" },
    };

    const scrubbed = scrubSentryEvent(event);

    expect(scrubbed.extra?.distanceMeters).toBe(REDACTED);
    expect(scrubbed.extra?.routeName).toBe("POST /api/shifts/clock-in");
  });

  it("redacts an email address wherever it appears, even under an innocent key", () => {
    const event: Event = {
      extra: { detail: "failed for casey.worker@example.com while clocking in" },
    };

    const scrubbed = scrubSentryEvent(event);

    expect(scrubbed.extra?.detail).not.toContain("casey.worker@example.com");
    expect(scrubbed.extra?.detail).toContain(REDACTED);
  });

  it("redacts an email address inside an error message", () => {
    const event: Event = {
      message: "no user found for morgan.manager@example.com",
    };

    expect(scrubSentryEvent(event).message).not.toContain(
      "morgan.manager@example.com"
    );
  });

  it("keeps the internal user id but drops identifying fields", () => {
    const event: Event = {
      user: {
        id: "cmtxblc5e0000w8a31fis64ip",
        email: "casey.worker@example.com",
        username: "casey",
        ip_address: "203.0.113.7",
      },
    };

    const scrubbed = scrubSentryEvent(event);

    expect(scrubbed.user?.id).toBe("cmtxblc5e0000w8a31fis64ip");
    expect(scrubbed.user?.email).toBeUndefined();
    expect(scrubbed.user?.username).toBeUndefined();
    expect(scrubbed.user?.ip_address).toBeUndefined();
  });

  it("leaves an event with nothing sensitive untouched", () => {
    const event: Event = {
      message: "Prisma connection pool timeout",
      tags: { routeName: "GET /api/manager/staff", role: "MANAGER" },
      extra: { organizationId: "cmtxbrbtw000010a3ahz8or9f", attempt: 2 },
    };

    expect(scrubSentryEvent(event)).toEqual(event);
  });

  it("survives an event with no request, user, or breadcrumbs", () => {
    expect(() => scrubSentryEvent({})).not.toThrow();
  });

  it("redacts span data on a transaction event", () => {
    const event = {
      type: "transaction" as const,
      spans: [
        {
          description: "POST /api/shifts/clock-in",
          data: { clockInLongitude: -0.1278, "db.statement": "SELECT 1" },
        },
      ],
    } as unknown as Event;

    const scrubbed = scrubSentryEvent(event) as unknown as {
      spans: { data: Record<string, unknown> }[];
    };

    expect(scrubbed.spans[0].data.clockInLongitude).toBe(REDACTED);
  });

  it("catches coordinate keys the exact-name list would miss", () => {
    const event: Event = {
      extra: {
        workplaceLongitude: -0.1278,
        distanceFromWorkplaceMeters: 4821.7,
        clockOutNote: "handover done",
      },
    };

    const scrubbed = scrubSentryEvent(event);

    expect(scrubbed.extra?.workplaceLongitude).toBe(REDACTED);
    expect(scrubbed.extra?.distanceFromWorkplaceMeters).toBe(REDACTED);
    expect(scrubbed.extra?.clockOutNote).toBe(REDACTED);
  });

  it("does not over-redact keys that merely contain a sensitive word", () => {
    const event: Event = {
      tags: { routeName: "POST /api/shifts/clock-in" },
      extra: { organizationId: "org-1", attemptCount: 3 },
    };

    const scrubbed = scrubSentryEvent(event);

    expect(scrubbed.tags?.routeName).toBe("POST /api/shifts/clock-in");
    expect(scrubbed.extra?.organizationId).toBe("org-1");
    expect(scrubbed.extra?.attemptCount).toBe(3);
  });

  it("redacts coordinates nested several levels deep", () => {
    const event: Event = {
      contexts: {
        shift: { payload: { input: { latitude: 51.5074 } } },
      },
    };

    const scrubbed = scrubSentryEvent(event);
    const shift = scrubbed.contexts?.shift as {
      payload: { input: { latitude: unknown } };
    };

    expect(shift.payload.input.latitude).toBe(REDACTED);
  });
});
