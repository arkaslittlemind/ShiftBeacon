"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  BurgerMenuThreeIcon,
  GridDashboard02Icon,
  MapIcon,
  UserIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ManagerSidebarContent } from "@/components/shell/manager-sidebar-content";
import { UserMenu } from "@/components/shell/user-menu";
import { crumbForPath, type CrumbIcon } from "@/lib/shell/crumb";
import type { IconComponent } from "@/types/icons";
import type { CurrentUser } from "@/types/user";

const CRUMB_ICONS: Record<CrumbIcon, IconComponent> = {
  dashboard: GridDashboard02Icon,
  workplace: MapIcon,
  profile: UserIcon,
  staff: UserIcon,
};

export function ManagerTopbar({
  user,
  organizationName,
}: {
  user: CurrentUser;
  organizationName: string;
}) {
  const [open, setOpen] = useState(false);
  const crumb = crumbForPath(usePathname());
  const CrumbIconComponent = CRUMB_ICONS[crumb.icon];

  return (
    <div className="flex items-center justify-between px-4 pt-4 sm:px-6 lg:px-8">
      <p className="hidden items-center gap-2 h-8.5 rounded-lg border border-border-soft bg-card px-3 font-mono text-xs text-muted-foreground md:inline-flex">
        <CrumbIconComponent aria-hidden className="size-3.5 shrink-0" />
        {crumb.label}
      </p>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="Open navigation menu"
            className="md:hidden"
          >
            <BurgerMenuThreeIcon aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="gap-0 p-0">
          <SheetTitle className="sr-only">Manager navigation</SheetTitle>
          <ManagerSidebarContent
            organizationName={organizationName}
            user={user}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="md:hidden">
        <UserMenu name={user.name} email={user.email} profileHref="/manager/profile" />
      </div>
    </div>
  );
}
