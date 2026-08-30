import type { Role } from "@/types/user";

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
