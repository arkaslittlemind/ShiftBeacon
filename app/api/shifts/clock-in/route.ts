import { requireApiUser } from "@/lib/api/auth";
import { withRouteHandler } from "@/lib/api/handler";
import { apiError, apiSuccess } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validate";
import {
  ActiveShiftExistsError,
  OutsidePerimeterError,
  clockIn,
} from "@/lib/services/shift-service";
import { clockInSchema } from "@/lib/validation/shift";
import type { ShiftResponse } from "@/types/shift";

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
      const response: ShiftResponse = {
        id: shift.id,
        clockInAt: shift.clockInAt.toISOString(),
        clockInLatitude: shift.clockInLatitude,
        clockInLongitude: shift.clockInLongitude,
        clockInNote: shift.clockInNote,
        clockOutAt: null,
        clockOutLatitude: null,
        clockOutLongitude: null,
        clockOutNote: null,
      };
      return apiSuccess(response);
    } catch (error) {
      if (error instanceof ActiveShiftExistsError) {
        return apiError(409, error.message);
      }
      if (error instanceof OutsidePerimeterError) {
        return apiError(422, error.message);
      }
      throw error;
    }
  }
);
