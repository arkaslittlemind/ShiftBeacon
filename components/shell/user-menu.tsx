"use client";

import Link from "next/link";
import { ChevronDownIcon } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutLink } from "@/components/shell/logout-link";
import { cn } from "@/lib/utils";
import { ROLE_LABEL, type Role } from "@/types/user";

export type UserMenuLayout = "avatar" | "inline" | "card";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full border border-ocean-tint bg-ocean-soft text-xs font-semibold text-ocean",
        className
      )}
    >
      {initials}
    </span>
  );
}

const TRIGGER_BASE =
  "outline-none transition-colors duration-(--dur-fast) ease-[ease] focus-visible:ring-3 focus-visible:ring-ring/50";

const TRIGGER_LAYOUT: Record<UserMenuLayout, string> = {
  avatar: "grid size-11 place-items-center rounded-full",
  inline: "flex min-h-11 items-center gap-2.5 rounded-lg px-1.5 text-sm text-foreground hover:bg-surface-alt",
  card: "flex w-full items-center gap-3 rounded-xl border border-border-soft bg-card p-3 text-left shadow-sm hover:bg-surface-alt",
};

export function UserMenu({
  name,
  email,
  role,
  profileHref,
  layout = "avatar",
  onNavigate,
}: {
  name: string;
  email: string;
  role?: Role;
  profileHref: string;
  layout?: UserMenuLayout;
  onNavigate?: () => void;
}) {
  const displayName = name || email;
  const initials = getInitials(displayName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open user menu"
        className={cn(TRIGGER_BASE, TRIGGER_LAYOUT[layout])}
      >
        <Avatar initials={initials} />
        {layout !== "avatar" && (
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-medium">{displayName}</span>
            {layout === "card" && role && (
              <span className="truncate text-xs text-muted-foreground">{ROLE_LABEL[role]}</span>
            )}
          </span>
        )}
        {layout !== "avatar" && (
          <ChevronDownIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={layout === "card" ? "start" : "end"} side={layout === "card" ? "top" : "bottom"}>
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="truncate font-semibold">{name || "Signed in"}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={profileHref} onClick={onNavigate}>
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <LogoutLink>Log out</LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
