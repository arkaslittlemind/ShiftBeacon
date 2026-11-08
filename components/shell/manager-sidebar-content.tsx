"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridDashboard02Icon, MapIcon } from "@/components/icons";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { UserMenu } from "@/components/shell/user-menu";
import { cn, focusRingClass, monoLabelClass } from "@/lib/utils";
import type { IconComponent } from "@/types/icons";
import type { CurrentUser } from "@/types/user";

const NAV_LINKS: { href: string; label: string; icon: IconComponent }[] = [
  { href: "/manager/dashboard", label: "Dashboard", icon: GridDashboard02Icon },
  { href: "/manager/workplace", label: "Workplace", icon: MapIcon },
];

export function ManagerSidebarContent({
  organizationName,
  user,
  onNavigate,
}: {
  organizationName: string;
  user: CurrentUser;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col gap-6 px-3 py-5">
      <Link
        href="/manager/dashboard"
        onClick={onNavigate}
        className={cn("flex flex-col gap-1 rounded-lg px-2 py-1", focusRingClass)}
      >
        <BrandLockup />
        <span className={cn("truncate pl-9", monoLabelClass)}>
          {organizationName}
        </span>
      </Link>

      <nav aria-label="Manager" className="flex flex-col gap-1">
        <p className={cn("px-2 pb-1", monoLabelClass)}>
          Manage
        </p>
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-2.5 rounded-lg border px-2.5 text-sm md:min-h-9.5",
                focusRingClass,
                active
                  ? "border-border-soft bg-card font-semibold text-foreground shadow-sm"
                  : "border-transparent text-muted-foreground transition-colors duration-(--dur-fast) ease-[ease] hover:bg-surface-alt hover:text-foreground"
              )}
            >
              <Icon aria-hidden className={cn("size-4.5 shrink-0", active && "text-ocean")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <UserMenu
          name={user.name}
          email={user.email}
          role={user.role}
          profileHref="/manager/profile"
          layout="card"
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
