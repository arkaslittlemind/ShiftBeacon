import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutLink } from "@/components/shell/logout-link";
import { getCurrentUser } from "@/lib/auth";
import { cn, eyebrowClass } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#compare", label: "Why ShiftBeacon" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();
  const dashboardHref = user?.role === "MANAGER" ? "/manager/dashboard" : "/worker/home";

  return (
    <header className="sticky top-0 z-40 border-b-(length:--border-w-lg) border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-sm font-heading text-lg font-bold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="size-2.5 border-2 border-border bg-primary" />
          ShiftBeacon
        </Link>

        <nav className={cn(eyebrowClass, "hidden items-center gap-8 md:flex")}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-sm outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href={dashboardHref}
                className="hidden rounded-sm text-sm font-bold outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:inline-block"
              >
                Dashboard
              </Link>
              <Button asChild size="sm" variant="outline">
                <LogoutLink>Log out</LogoutLink>
              </Button>
            </>
          ) : (
            <>
              <a
                href="/auth/login"
                className="hidden rounded-sm text-sm font-bold outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:inline-block"
              >
                Log in
              </a>
              <Button asChild size="sm" variant="outline">
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
