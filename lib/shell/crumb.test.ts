import { describe, expect, it } from "vitest";
import { crumbForPath } from "./crumb";

describe("crumbForPath", () => {
  it.each([
    ["/manager/dashboard", "Dashboard", "dashboard"],
    ["/manager/workplace", "Workplace", "workplace"],
    ["/manager/profile", "Profile", "profile"],
    ["/manager/staff/cm1abc", "Staff", "staff"],
  ] as const)("maps %s to %s", (path, label, icon) => {
    expect(crumbForPath(path)).toEqual({ label, icon });
  });

  it("ignores a trailing slash", () => {
    expect(crumbForPath("/manager/workplace/")).toEqual({ label: "Workplace", icon: "workplace" });
  });

  it("matches a section, not a prefix of a longer segment", () => {
    expect(crumbForPath("/manager/staffing")).toEqual({ label: "Dashboard", icon: "dashboard" });
  });

  it("only reads manager routes", () => {
    expect(crumbForPath("/worker/profile")).toEqual({ label: "Dashboard", icon: "dashboard" });
  });

  it("falls back to Dashboard for an unknown path", () => {
    expect(crumbForPath("/manager/unknown")).toEqual({ label: "Dashboard", icon: "dashboard" });
    expect(crumbForPath("")).toEqual({ label: "Dashboard", icon: "dashboard" });
    expect(crumbForPath("/manager/constructor")).toEqual({ label: "Dashboard", icon: "dashboard" });
  });
});
