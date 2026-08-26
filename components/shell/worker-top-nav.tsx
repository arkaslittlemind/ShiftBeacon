"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserMenu } from "@/components/shell/user-menu";

const NAV_LINKS = [{ href: "/worker/home", label: "Home" }];

export function WorkerTopNav() {
  const pathname = usePathname();

  return (
    <header className="border-b-(length:--border-w-lg) border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/worker/home" className="flex items-center gap-2 font-heading text-lg font-bold">
          <span className="size-2.5 border-2 border-border bg-primary" />
          ShiftBeacon
        </Link>

        <nav className="hidden items-center gap-7 text-xs font-bold tracking-wide text-muted-foreground uppercase md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "hover:text-foreground",
                pathname === link.href && "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
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
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="size-2.5 border-2 border-border bg-primary" />
                  ShiftBeacon
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link
                      href={link.href}
                      className={cn(
                        "rounded-md px-3 py-2.5 text-xs font-bold tracking-wide uppercase",
                        pathname === link.href
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <UserMenu initials="JM" />
        </div>
      </div>
    </header>
  );
}
