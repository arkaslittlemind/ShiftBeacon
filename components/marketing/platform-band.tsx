import { ArrowRightIcon, ClockIcon, GridDashboard02Icon, MapIcon, UserIcon } from "@/components/icons";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { GlassFrame } from "@/components/marketing/glass-frame";
import { Painting } from "@/components/marketing/painting";
import { SectionHead } from "@/components/marketing/section-head";
import { Button } from "@/components/ui/button";
import { cn, monoLabelClass } from "@/lib/utils";
import cliffWalk from "@/public/images/marketing/cliff-walk.jpg";
import type { IconComponent } from "@/types/icons";

const TILES: { label: string; icon: IconComponent; value: string }[] = [
  { label: "On shift", icon: UserIcon, value: "14" },
  { label: "Clock-ins", icon: ClockIcon, value: "16" },
  { label: "Avg hours", icon: ClockIcon, value: "7.6h" },
];

// A week of clock-ins; the last bar is today.
const BARS = ["h-[55%]", "h-[72%]", "h-[84%]", "h-[66%]", "h-[52%]", "h-[61%]", "h-[78%]"];

function DashboardPreview() {
  return (
    <div aria-hidden className="flex min-h-80 text-left">
      <div className="hidden w-44 shrink-0 flex-col gap-1 border-r border-border-soft p-4 md:flex">
        <BrandLockup className="mb-3 text-sm" />
        <span className="flex items-center gap-2 rounded-lg border border-border-soft bg-card px-2.5 py-2 text-sm font-semibold text-foreground shadow-sm">
          <GridDashboard02Icon className="size-4 text-ocean" />
          Dashboard
        </span>
        <span className="flex items-center gap-2 px-2.5 py-2 text-sm text-muted-foreground">
          <MapIcon className="size-4" />
          Workplace
        </span>
      </div>
      <div className="min-w-0 flex-1 p-5 md:p-6">
        <p className="font-heading text-2xl text-foreground">Hello, Priya</p>
        <p className="mt-1 text-sm text-muted-foreground">14 of 17 staff are on shift.</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {TILES.map(({ label, icon: Icon, value }) => (
            <div key={label} className="rounded-xl border border-border-soft p-3">
              <div className="flex items-center justify-between gap-1">
                <span className={cn(monoLabelClass, "truncate")}>{label}</span>
                <Icon className="hidden size-3.5 shrink-0 text-faint sm:block" />
              </div>
              <p className="mt-1.5 font-heading text-2xl leading-none text-foreground">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex h-24 items-end gap-3 border-b border-border-soft">
          {BARS.map((height, index) => (
            <span
              key={height}
              className={cn(
                "flex-1 rounded-t-md",
                height,
                index === BARS.length - 1 ? "bg-chart-1" : "bg-chart-3"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PlatformBand() {
  return (
    <section className="dot-grid border-t border-border-soft">
      <div className="px-5 pt-20 pb-14 md:px-10 md:pt-28">
        <SectionHead
          eyebrow="A complete platform"
          title="Everything your shift lead needs, in one place."
        >
          <Button asChild size="lg" className="mt-2">
            <a href="#demo">
              Request a demo
              <ArrowRightIcon aria-hidden />
            </a>
          </Button>
        </SectionHead>
      </div>
      <div className="relative overflow-hidden px-5 pt-16 md:px-12 md:pt-24">
        <Painting
          src={cliffWalk}
          alt="Claude Monet, The Cliff Walk at Pourville, behind the ShiftBeacon dashboard"
          sizes="(min-width: 1240px) 1240px, 100vw"
          className="object-[center_30%]"
        />
        <GlassFrame
          className="relative mx-auto max-w-4xl rounded-b-none border-b-0 pb-0"
          innerClassName="rounded-b-none border-b-0 p-0"
        >
          <DashboardPreview />
        </GlassFrame>
      </div>
    </section>
  );
}
