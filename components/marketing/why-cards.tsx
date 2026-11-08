import { ArrowRightIcon, CheckTickCircleIcon, ClockIcon, MapPinIcon } from "@/components/icons";
import { GlassFrame } from "@/components/marketing/glass-frame";
import { Painting } from "@/components/marketing/painting";
import { SectionHead } from "@/components/marketing/section-head";
import { Badge } from "@/components/ui/badge";
import { cn, monoLabelClass } from "@/lib/utils";
import cliffWalk from "@/public/images/marketing/cliff-walk.jpg";
import lowTide from "@/public/images/marketing/low-tide.jpg";
import type { StaticImageData } from "next/image";
import type { IconComponent } from "@/types/icons";

const ART_SIZES = "(min-width: 1240px) 580px, (min-width: 768px) 50vw, 100vw";

const RULES = ["Within 150 m of St. Mary's", "No other shift open", "Checked on the server"];

const ON_SHIFT = [
  { name: "Amara Mensah", duration: "4h 12m" },
  { name: "Jonah Lee", duration: "4h 06m" },
  { name: "Sofia Ruiz", duration: "2h 40m" },
  { name: "Tomás Barros", duration: "2h 09m" },
];

function ResultRow({ children, badge }: { children: React.ReactNode; badge: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-alt px-3 py-2 text-sm text-foreground">
      <span className="min-w-0 truncate">{children}</span>
      {badge}
    </div>
  );
}

function WhyCard({
  painting,
  crop,
  icon: Icon,
  title,
  description,
  children,
}: {
  painting: StaticImageData;
  crop: string;
  icon: IconComponent;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <article>
      <div className="relative grid place-items-center overflow-hidden rounded-[22px] border border-border-soft p-5 py-8 md:aspect-4/3 md:py-5">
        <Painting src={painting} alt="" sizes={ART_SIZES} className={crop} />
        <GlassFrame className="relative w-full max-w-sm">
          {/* The card is an illustration of the product, not a control. */}
          <div aria-hidden className="grid gap-2">
            {children}
          </div>
        </GlassFrame>
      </div>
      <h3 className="mt-5 flex items-center gap-2.5 font-sans text-lg font-medium text-foreground">
        <span className="grid size-8 place-items-center rounded-full bg-ocean-soft text-ocean">
          <Icon aria-hidden className="size-4" />
        </span>
        {title}
      </h3>
      <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </article>
  );
}

export function WhyCards() {
  return (
    <section
      id="why"
      className="scroll-mt-20 border-t border-border-soft px-5 py-20 md:px-10 md:py-28"
    >
      <SectionHead
        align="left"
        eyebrow="Why ShiftBeacon"
        title="Built on presence, not paperwork."
        description="Sign-in sheets get filled in from memory at the end of a shift. ShiftBeacon records arrival the moment it happens, on site."
        className="mb-12"
      />
      <div className="grid gap-8 md:grid-cols-2">
        <WhyCard
          painting={lowTide}
          crop="object-[80%_40%]"
          icon={MapPinIcon}
          title="Verified on site, not self-reported"
          description="Every clock-in is checked against your perimeter on our server, not just on the worker's phone."
        >
          <p className={monoLabelClass}>Clock-in rules</p>
          {RULES.map((rule) => (
            <p key={rule} className="flex items-center gap-2 text-sm text-foreground">
              <CheckTickCircleIcon className="size-4 shrink-0 text-success" />
              {rule}
            </p>
          ))}
          <span className="mx-auto grid size-6 place-items-center rounded-full bg-surface-alt text-faint">
            <ArrowRightIcon className="size-3.5 rotate-90" />
          </span>
          <ResultRow badge={<Badge variant="success">Accepted</Badge>}>Amara Mensah · 42 m</ResultRow>
          <ResultRow badge={<Badge variant="danger">Outside</Badge>}>
            Jonah Lee · 380 m
          </ResultRow>
        </WhyCard>
        <WhyCard
          painting={cliffWalk}
          crop="object-[85%_60%]"
          icon={ClockIcon}
          title="Live, not end of shift"
          description="See who's in the building right now and how long they've been on, without waiting for an end-of-shift sheet."
        >
          <p className={cn(monoLabelClass, "mb-1")}>On shift now</p>
          {ON_SHIFT.map((person) => (
            <ResultRow
              key={person.name}
              badge={
                <Badge variant="success" dot>
                  On shift · {person.duration}
                </Badge>
              }
            >
              {person.name}
            </ResultRow>
          ))}
        </WhyCard>
      </div>
    </section>
  );
}
