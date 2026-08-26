const LOGOS = [
  "Riverside Care",
  "Northgate Health",
  "Meadowview Trust",
  "Harbor Community Care",
];

export function TrustBar() {
  return (
    <div className="border-y-(length:--border-w) border-border py-7">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-8 px-6 md:px-10">
        <span className="text-xs font-bold tracking-wide text-faint uppercase">
          Trusted by care teams across the UK
        </span>
        <div className="flex flex-wrap gap-7">
          {LOGOS.map((logo) => (
            <span key={logo} className="font-heading text-base font-bold text-faint">
              {logo}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
