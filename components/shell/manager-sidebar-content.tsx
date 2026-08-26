"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [{ href: "/manager/dashboard", label: "Dashboard" }];

export function ManagerSidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col py-5">
      <Link
        href="/manager/dashboard"
        className="mb-2.5 flex items-center gap-2 border-b-2 border-background/15 px-5 pb-5.5 font-heading text-lg font-bold"
      >
        <span className="size-2.5 border-2 border-background bg-primary" />
        ShiftBeacon
      </Link>

      <div className="flex flex-col">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "border-l-4 border-transparent px-5 py-3 text-xs font-bold tracking-wide text-background/65 uppercase",
              pathname === link.href && "border-primary bg-background/10 text-background"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex-1" />

      <div className="mx-5 border-2 border-background/15 bg-background/10 p-3.5 text-xs text-background/65">
        <strong className="mb-0.5 block text-[13px] text-background">
          Riverside Care Home
        </strong>
        Workplace configuration coming soon
      </div>
    </div>
  );
}
