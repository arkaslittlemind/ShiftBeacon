import type { Role } from "@/types/user";
import type { ShiftResponse } from "@/types/shift";

export type StaffMemberResponse = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "CLOCKED_IN" | "CLOCKED_OUT";
  activeShift: {
    clockInAt: string;
    clockInLatitude: number;
    clockInLongitude: number;
  } | null;
};

export type StaffShiftHistoryResponse = {
  staff: { id: string; name: string; role: Role };
  activeShift: ShiftResponse | null;
  history: ShiftResponse[];
};
