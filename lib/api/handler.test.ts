import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Sentry from "@sentry/nextjs";
import { apiSuccess } from "@/lib/api/response";
import { withRouteHandler } from "./handler";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("withRouteHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes through a successful response unchanged", async () => {
    const handler = withRouteHandler("GET /api/test", async () =>
      apiSuccess({ ok: true })
    );

    const response = await handler();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ data: { ok: true } });
  });

  it("returns a generic 500 and logs when the handler throws an unrecognized error", async () => {
    const handler = withRouteHandler("GET /api/test", async () => {
      throw new Error("column organization_id does not exist");
    });

    const response = await handler();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: { message: "Something went wrong" } });
    expect(body.error.message).not.toContain("column");
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("reports the unhandled error to Sentry, tagged with the route", async () => {
    const thrown = new Error("column organization_id does not exist");
    const handler = withRouteHandler("POST /api/shifts/clock-in", async () => {
      throw thrown;
    });

    await handler();

    expect(Sentry.captureException).toHaveBeenCalledWith(
      thrown,
      expect.objectContaining({
        tags: expect.objectContaining({ route: "POST /api/shifts/clock-in" }),
      })
    );
  });

  it("does not report anything to Sentry on the success path", async () => {
    const handler = withRouteHandler("GET /api/test", async () =>
      apiSuccess({ ok: true })
    );

    await handler();

    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it("forwards arguments to the wrapped handler", async () => {
    const inner = vi.fn(async (request: Request) => apiSuccess({ url: request.url }));
    const handler = withRouteHandler("GET /api/test/[id]", inner);
    const request = new Request("http://localhost/api/test/123");

    await handler(request);

    expect(inner).toHaveBeenCalledWith(request);
  });
});
