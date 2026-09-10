import type { NextResponse } from "next/server";
import { apiError } from "@/lib/api/response";

type RouteHandler<Args extends unknown[]> = (
  ...args: Args
) => Promise<NextResponse> | NextResponse;

// Route handlers map their own domain errors (ActiveShiftExistsError, etc.)
// to specific statuses and rethrow anything else. This catches what falls
// through: logs it server-side and returns a generic body so internals
// (stack traces, Prisma error text) never reach the client.
export function withRouteHandler<Args extends unknown[]>(
  routeName: string,
  handler: RouteHandler<Args>
): RouteHandler<Args> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error(
        `[api] unhandled error in ${routeName}:`,
        error instanceof Error ? error.message : error
      );
      return apiError(500, "Something went wrong");
    }
  };
}
