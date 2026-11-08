import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { LogoutLink } from "@/components/shell/logout-link";
import { getCurrentUser } from "@/lib/auth";
import { cn, focusRingClass } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#why", label: "Why ShiftBeacon" },
  { href: "#faq", label: "FAQ" },
  { href: "#demo", label: "Book a call" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();
  const dashboardHref = user?.role === "MANAGER" ? "/manager/dashboard" : "/worker/home";

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-background/90 backdrop-blur-[10px]">
      <div className="grid h-17 grid-cols-[1fr_auto] items-center gap-4 px-5 md:grid-cols-[1fr_auto_1fr] md:px-10">
        <Link href="/" className={cn("w-fit rounded-lg", focusRingClass)}>
          <BrandLockup />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md transition-colors duration-(--dur-fast) ease-[ease] hover:text-foreground",
                focusRingClass
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-2">
          {user ? (
            <>
              <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                <Link href={dashboardHref}>Dashboard</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <LogoutLink>Log out</LogoutLink>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <a href="/auth/login">Log in</a>
              </Button>
              <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
                <a href="/auth/login?screen_hint=signup">Sign up</a>
              </Button>
              <Button asChild size="sm">
                <a href="#demo">Request a demo</a>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
