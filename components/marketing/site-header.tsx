import Link from "next/link";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#compare", label: "Why ShiftBeacon" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-(length:--border-w-lg) border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold">
          <span className="size-2.5 border-2 border-border bg-primary" />
          ShiftBeacon
        </Link>

        <nav className="hidden items-center gap-8 text-xs font-bold tracking-wide text-muted-foreground uppercase md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a href="#" className="hidden text-sm font-bold sm:inline-block">
            Log in
          </a>
          <Button asChild size="sm">
            <a href="#demo">Request a demo</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
