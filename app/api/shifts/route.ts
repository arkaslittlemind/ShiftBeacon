import { requireApiUser } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { getShiftsForUser } from "@/lib/services/shift-service";
import type { ShiftResponse, ShiftsResponse } from "@/types/shift";

function toShiftResponse(shift: {
  id: string;
  clockInAt: Date;
  clockInLatitude: number;
  clockInLongitude: number;
  clockInNote: string | null;
  clockOutAt: Date | null;
  clockOutLatitude: number | null;
  clockOutLongitude: number | null;
  clockOutNote: string | null;
}): ShiftResponse {
  return {
    id: shift.id,
    clockInAt: shift.clockInAt.toISOString(),
    clockInLatitude: shift.clockInLatitude,
    clockInLongitude: shift.clockInLongitude,
    clockInNote: shift.clockInNote,
    clockOutAt: shift.clockOutAt ? shift.clockOutAt.toISOString() : null,
    clockOutLatitude: shift.clockOutLatitude,
    clockOutLongitude: shift.clockOutLongitude,
    clockOutNote: shift.clockOutNote,
  };
}

export async function GET() {
  const result = await requireApiUser();
  if (!result.ok) {
    return result.response;
  }

  const { activeShift, history } = await getShiftsForUser(result.user.id);
  const response: ShiftsResponse = {
    activeShift: activeShift ? toShiftResponse(activeShift) : null,
    history: history.map(toShiftResponse),
  };

  return apiSuccess(response);
}
