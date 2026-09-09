"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/manager/dashboard", label: "Dashboard" },
  { href: "/manager/workplace", label: "Workplace" },
];

export function ManagerSidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col py-5">
      <Link
        href="/manager/dashboard"
        className="mb-2.5 flex items-center gap-2 rounded-sm border-b-2 border-background/15 px-5 pb-5.5 font-heading text-lg font-bold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
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
              "border-l-4 border-transparent px-5 py-3 text-xs font-bold tracking-wide text-background/65 uppercase outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
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
        <Link
          href="/manager/workplace"
          className="rounded-sm underline underline-offset-2 outline-none hover:text-background focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Edit in Workplace settings
        </Link>
      </div>
    </div>
  );
}
