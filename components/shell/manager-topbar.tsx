"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ManagerSidebarContent } from "@/components/shell/manager-sidebar-content";
import { UserMenu } from "@/components/shell/user-menu";

export function ManagerTopbar() {
  return (
    <div className="flex items-center justify-between border-b border-border-soft px-4 py-3 md:justify-end md:px-8">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Open navigation menu"
            className="md:hidden"
          >
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-55 gap-0 border-border bg-foreground p-0 text-background sm:max-w-55"
        >
          <SheetTitle className="sr-only">Manager navigation</SheetTitle>
          <ManagerSidebarContent />
        </SheetContent>
      </Sheet>

      <UserMenu initials="AM" />
    </div>
  );
}
