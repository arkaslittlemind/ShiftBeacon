import type { Role } from "@/types/user";

export type MeResponse = {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    clockInRadiusMeters: number;
  };
};
