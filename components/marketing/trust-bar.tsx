import { BuildingApartmentTwoIcon, HeartIcon, ShieldCheckIcon, SunIcon } from "@/components/icons";
import { cn, monoLabelClass } from "@/lib/utils";

// Illustrative names, not customers; kept geography-neutral on purpose.
const NAMES = [
  { icon: HeartIcon, name: "Harborview Care" },
  { icon: BuildingApartmentTwoIcon, name: "Northwind Clinics" },
  { icon: ShieldCheckIcon, name: "Tidewater Health" },
  { icon: SunIcon, name: "Meadowbank Homes" },
];

export function TrustBar() {
  return (
    <div className="bg-primary px-5 py-12 text-center md:px-10">
      <p className={cn(monoLabelClass, "text-primary-foreground/70")}>Trusted by care teams</p>
      <ul className="mt-6 flex flex-wrap justify-center gap-x-12 gap-y-5 md:justify-around">
        {NAMES.map(({ icon: Icon, name }) => (
          <li
            key={name}
            className="inline-flex items-center gap-2.5 font-heading text-xl text-primary-foreground/80"
          >
            <Icon aria-hidden className="size-5" />
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
