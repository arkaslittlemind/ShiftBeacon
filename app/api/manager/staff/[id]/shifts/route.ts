import { requireApiUser } from "@/lib/api/auth";
import { withRouteHandler } from "@/lib/api/handler";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getShiftHistoryForStaffMember } from "@/lib/services/staff-service";
import { toShiftResponse } from "@/lib/services/shift-service";
import type { StaffShiftHistoryResponse } from "@/types/staff";

export const GET = withRouteHandler(
  "GET /api/manager/staff/[id]/shifts",
  async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const result = await requireApiUser({ role: "MANAGER" });
    if (!result.ok) {
      return result.response;
    }

    const { id } = await params;
    const record = await getShiftHistoryForStaffMember(
      result.user.organizationId,
      id
    );
    if (!record) {
      return apiError(404, "Staff member not found");
    }

    const response: StaffShiftHistoryResponse = {
      staff: {
        id: record.staff.id,
        name: record.staff.name,
        role: record.staff.role,
      },
      activeShift: record.activeShift ? toShiftResponse(record.activeShift) : null,
      history: record.history.map(toShiftResponse),
    };

    return apiSuccess(response);
  }
);
