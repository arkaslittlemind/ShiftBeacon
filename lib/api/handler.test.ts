import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiSuccess } from "@/lib/api/response";
import { withRouteHandler } from "./handler";

describe("withRouteHandler", () => {
  beforeEach(() => {
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

  it("forwards arguments to the wrapped handler", async () => {
    const inner = vi.fn(async (request: Request) => apiSuccess({ url: request.url }));
    const handler = withRouteHandler("GET /api/test/[id]", inner);
    const request = new Request("http://localhost/api/test/123");

    await handler(request);

    expect(inner).toHaveBeenCalledWith(request);
  });
});
