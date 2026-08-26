"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ initials }: { initials: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open user menu"
        className="flex size-9 items-center justify-center border-2 border-border bg-primary text-xs font-bold text-primary-foreground"
      >
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Profile (coming soon)</DropdownMenuItem>
        <DropdownMenuItem disabled>Log out (coming soon)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
