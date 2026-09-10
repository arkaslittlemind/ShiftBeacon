import { requireApiUser } from "@/lib/api/auth";
import { withRouteHandler } from "@/lib/api/handler";
import { apiSuccess } from "@/lib/api/response";
import { getShiftsForUser, toShiftResponse } from "@/lib/services/shift-service";
import type { ShiftsResponse } from "@/types/shift";

export const GET = withRouteHandler("GET /api/shifts", async () => {
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
});
