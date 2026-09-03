import { z } from "zod";
import { requireApiUser } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validate";
import { NoActiveShiftError, clockOut } from "@/lib/services/shift-service";
import type { ClockOutInput, ShiftResponse } from "@/types/shift";

const clockOutSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  note: z.string().trim().min(1).optional(),
}) satisfies z.ZodType<ClockOutInput>;

export async function POST(request: Request) {
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
