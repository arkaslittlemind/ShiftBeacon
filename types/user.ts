export type Role = "CARE_WORKER" | "MANAGER";

export const ROLE_LABEL: Record<Role, string> = {
  CARE_WORKER: "Care worker",
  MANAGER: "Manager",
};

export type CurrentUser = {
  role: Role;
  name: string;
  email: string;
};
