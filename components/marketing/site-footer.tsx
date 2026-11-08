import { BrandLockup } from "@/components/brand/brand-lockup";
import { Painting } from "@/components/marketing/painting";
import { cn, focusRingClass, monoLabelClass } from "@/lib/utils";
import beachPourville from "@/public/images/marketing/beach-pourville.jpg";

// About, Privacy, and Security have no pages yet; they stay placeholders.
const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { href: "#how-it-works", label: "How it works" },
      { href: "#why", label: "Why ShiftBeacon" },
      { href: "#faq", label: "FAQ" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "#", label: "About" },
      { href: "#demo", label: "Book a call" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "#", label: "Privacy" },
      { href: "#", label: "Security" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border-soft">
      <div className="grid gap-10 px-5 py-14 md:grid-cols-[1.6fr_repeat(3,1fr)] md:px-10">
        <div>
          <BrandLockup />
          <p className="mt-4 max-w-[30ch] text-sm text-muted-foreground">
            Know exactly who&apos;s on shift. Calm, location-aware attendance for care teams.
          </p>
        </div>
        {FOOTER_LINKS.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <p className={cn(monoLabelClass, "mb-4")}>{column.heading}</p>
            <ul className="flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className={cn(
                      "rounded-md text-sm text-muted-foreground transition-colors duration-(--dur-fast) ease-[ease] hover:text-foreground",
                      focusRingClass
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-border-soft px-5 py-5 text-xs text-faint md:px-10">
        <span>&copy; 2026 ShiftBeacon</span>
        <span>
          Paintings by Claude Monet (public domain), including Low Tide at Pourville and The Cliff
          Walk at Pourville.
        </span>
      </div>
      <div aria-hidden className="relative h-55 overflow-hidden">
        <Painting
          src={beachPourville}
          alt=""
          sizes="(min-width: 1240px) 1240px, 100vw"
          className="object-[center_72%]"
        />
      </div>
    </footer>
  );
}
