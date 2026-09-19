import { after } from "next/server";
import { requireApiUser } from "@/lib/api/auth";
import { withRouteHandler } from "@/lib/api/handler";
import { captureServerEvent } from "@/lib/observability/events";
import { apiError, apiSuccess } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validate";
import {
  ActiveShiftExistsError,
  OutsidePerimeterError,
  clockIn,
  toShiftResponse,
} from "@/lib/services/shift-service";
import { clockInSchema } from "@/lib/validation/shift";

export const POST = withRouteHandler(
  "POST /api/shifts/clock-in",
  async (request: Request) => {
    const result = await requireApiUser({ role: "CARE_WORKER" });
    if (!result.ok) {
      return result.response;
    }

    const parsed = await parseJsonBody(request, clockInSchema);
    if (!parsed.ok) {
      return parsed.response;
    }

    try {
      const shift = await clockIn(
        result.user.id,
        result.user.organizationId,
        parsed.data
      );
      after(() =>
        captureServerEvent(result.user, {
          name: "shift_clock_in_succeeded",
          hasNote: Boolean(parsed.data.note),
        })
      );
      return apiSuccess(toShiftResponse(shift));
    } catch (error) {
      if (error instanceof ActiveShiftExistsError) {
        after(() =>
          captureServerEvent(result.user, {
            name: "shift_clock_in_rejected",
            reason: "active_shift_exists",
          })
        );
        return apiError(409, error.message);
      }
      if (error instanceof OutsidePerimeterError) {
        // The rejection rate is the whole reason this feature exists: these
        // attempts never become Shift rows, so the database cannot see them.
        after(() =>
          captureServerEvent(result.user, {
            name: "shift_clock_in_rejected",
            reason: "outside_perimeter",
          })
        );
        return apiError(422, error.message);
      }
      throw error;
    }
  }
);
