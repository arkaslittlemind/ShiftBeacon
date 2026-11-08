"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BurgerMenuThreeIcon, HomeIcon } from "@/components/icons";
import { cn, focusRingClass } from "@/lib/utils";
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
import { BrandLockup } from "@/components/brand/brand-lockup";
import type { IconComponent } from "@/types/icons";
import type { CurrentUser } from "@/types/user";

const NAV_LINKS: { href: string; label: string; icon: IconComponent }[] = [
  { href: "/worker/home", label: "Home", icon: HomeIcon },
];

function navLinkClass(active: boolean) {
  return cn(
    "flex items-center gap-2 rounded-lg px-3 text-sm font-medium",
    focusRingClass,
    // Only hover fades; the active pill switches instantly on navigation.
    active
      ? "bg-ocean-soft text-ocean"
      : "text-muted-foreground transition-colors duration-(--dur-fast) ease-[ease] hover:bg-surface-alt hover:text-foreground"
  );
}

export function WorkerTopNav({ user }: { user: CurrentUser }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border-soft bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 md:px-10">
        <div className="flex items-center gap-6">
          <Link href="/worker/home" className={cn("rounded-lg", focusRingClass)}>
            <BrandLockup />
          </Link>

          <nav aria-label="Worker" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(navLinkClass(active), "h-9")}
                >
                  <Icon aria-hidden className="size-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Sheet>
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
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>
                  <BrandLockup />
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Worker" className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <SheetClose key={href} asChild>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={cn(navLinkClass(active), "min-h-11")}
                      >
                        <Icon aria-hidden className="size-4 shrink-0" />
                        {label}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="hidden md:block">
            <UserMenu name={user.name} email={user.email} profileHref="/worker/profile" layout="inline" />
          </div>
          <div className="md:hidden">
            <UserMenu name={user.name} email={user.email} profileHref="/worker/profile" />
          </div>
        </div>
      </div>
    </header>
  );
}
