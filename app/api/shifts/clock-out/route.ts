import { requireApiUser } from "@/lib/api/auth";
import { withRouteHandler } from "@/lib/api/handler";
import { apiError, apiSuccess } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validate";
import { NoActiveShiftError, clockOut } from "@/lib/services/shift-service";
import { clockOutSchema } from "@/lib/validation/shift";
import type { ShiftResponse } from "@/types/shift";

export const POST = withRouteHandler(
  "POST /api/shifts/clock-out",
  async (request: Request) => {
    const result = await requireApiUser({ role: "CARE_WORKER" });
    if (!result.ok) {
      return result.response;
    }

    const parsed = await parseJsonBody(request, clockOutSchema);
    if (!parsed.ok) {
      return parsed.response;
    }

    try {
      const shift = await clockOut(result.user.id, parsed.data);
      const response: ShiftResponse = {
        id: shift.id,
        clockInAt: shift.clockInAt.toISOString(),
        clockInLatitude: shift.clockInLatitude,
        clockInLongitude: shift.clockInLongitude,
        clockInNote: shift.clockInNote,
        clockOutAt: shift.clockOutAt!.toISOString(),
        clockOutLatitude: shift.clockOutLatitude,
        clockOutLongitude: shift.clockOutLongitude,
        clockOutNote: shift.clockOutNote,
      };
      return apiSuccess(response);
    } catch (error) {
      if (error instanceof NoActiveShiftError) {
        return apiError(409, error.message);
      }
      throw error;
    }
  }
);
