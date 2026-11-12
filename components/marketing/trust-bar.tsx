import { BuildingApartmentTwoIcon, HeartIcon, ShieldCheckIcon, SunIcon } from "@/components/icons";
import { cn, monoLabelClass } from "@/lib/utils";

// Illustrative names, not customers; kept geography-neutral on purpose.
const NAMES = [
  { icon: HeartIcon, name: "Harborview Care" },
  { icon: BuildingApartmentTwoIcon, name: "Northwind Clinics" },
  { icon: ShieldCheckIcon, name: "Tidewater Health" },
  { icon: SunIcon, name: "Meadowbank Homes" },
];

// The track shifts by half its width, so an even count of identical sets loops
// without a jump. Six sets stay wider than the viewport on large monitors.
const SET_COUNT = 6;

const listClass = "flex shrink-0 items-center gap-12 pr-12 motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-5 motion-reduce:pr-0";

export function TrustBar() {
  return (
    <div className="bg-primary px-5 py-12 text-center md:px-10">
      <p className={cn(monoLabelClass, "text-primary-foreground/70")}>Trusted by care teams</p>
      <div className="group mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:[mask-image:none]">
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:justify-center">
          {Array.from({ length: SET_COUNT }, (_, set) => (
            <ul
              key={set}
              aria-hidden={set > 0 || undefined}
              className={cn(listClass, set > 0 && "motion-reduce:hidden")}
            >
              {NAMES.map(({ icon: Icon, name }) => (
                <li
                  key={name}
                  className="inline-flex items-center gap-2.5 whitespace-nowrap font-heading text-xl text-primary-foreground/80"
                >
                  <Icon aria-hidden className="size-5" />
                  {name}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
