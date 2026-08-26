const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { href: "#features", label: "Features" },
      { href: "#how-it-works", label: "How it works" },
      { href: "#compare", label: "Why ShiftBeacon" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "#", label: "About" },
      { href: "#", label: "Contact" },
      { href: "#demo", label: "Request a demo" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "#", label: "Privacy policy" },
      { href: "#", label: "Terms of service" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t-(length:--border-w-lg) border-border py-14">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-10 grid gap-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2 font-heading text-lg font-bold">
              <span className="size-2.5 border-2 border-border bg-primary" />
              ShiftBeacon
            </div>
            <p className="mt-3.5 max-w-[32ch] text-[13.5px] text-muted-foreground">
              Location-verified shift attendance and analytics for healthcare
              teams.
            </p>
          </div>
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-3.5 text-xs font-bold tracking-wide text-faint uppercase">
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13.5px] text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-2.5 border-t border-border-soft pt-6 text-xs text-faint">
          <span>&copy; 2026 ShiftBeacon. All rights reserved.</span>
          <span>Made for healthcare operations teams.</span>
        </div>
      </div>
    </footer>
  );
}
