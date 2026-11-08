export type CrumbIcon = "dashboard" | "workplace" | "profile" | "staff";

export interface Crumb {
  label: string;
  icon: CrumbIcon;
}

const SECTIONS: Record<string, Crumb> = {
  dashboard: { label: "Dashboard", icon: "dashboard" },
  workplace: { label: "Workplace", icon: "workplace" },
  profile: { label: "Profile", icon: "profile" },
  staff: { label: "Staff", icon: "staff" },
};

/** The topbar crumb for a manager route, keyed on the segment after `/manager`. */
export function crumbForPath(pathname: string): Crumb {
  const [area, section = ""] = pathname.split("/").filter(Boolean);
  if (area !== "manager") return SECTIONS.dashboard;
  return Object.hasOwn(SECTIONS, section) ? SECTIONS[section] : SECTIONS.dashboard;
}
