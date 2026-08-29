export type Role = "CARE_WORKER" | "MANAGER";

export type CurrentUser = {
  role: Role;
  name: string;
  email: string;
};
