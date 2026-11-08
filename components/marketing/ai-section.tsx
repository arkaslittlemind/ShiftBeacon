import { SendPlaneHorizontalIcon, SparkleAi01Icon } from "@/components/icons";
import { sectionTitleClass } from "@/components/marketing/section-head";
import { Button } from "@/components/ui/button";
import { cn, monoLabelClass } from "@/lib/utils";

// Questions the real ask card can answer from the last 7 days of shift records.
const STARTERS = [
  "Who worked the most hours?",
  "Busiest day this week?",
  "Average hours per day",
  "What did staff write in their notes?",
];

export function AiSection() {
  return (
    <section className="overflow-hidden bg-primary px-5 pt-20 text-center md:px-10 md:pt-28">
      <p className={cn(monoLabelClass, "text-primary-foreground/70")}>AI that stays in its lane</p>
      <h2 className={cn(sectionTitleClass, "mx-auto mt-4 max-w-3xl text-primary-foreground")}>
        Ask your attendance data, in plain language.
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/75 md:text-[1.0625rem]">
        Managers ask questions like &ldquo;Who worked over 40 hours this week?&rdquo; and get
        answers built only from their own organization&apos;s shift records. Clock-out notes
        become a handover summary for the next shift.
      </p>
      <Button asChild size="lg" variant="outline" className="mt-8">
        <a href="#demo">See it in a demo</a>
      </Button>

      {/* An illustration of the ask card: nothing here is a control or a live call. */}
      <div
        aria-hidden
        className="mx-auto mt-14 max-w-2xl rounded-t-[28px] bg-card p-5 text-left shadow-lg md:p-8"
      >
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border-soft px-3 py-1 text-xs text-muted-foreground">
          <SparkleAi01Icon className="size-3.5" />
          Ask about attendance
        </p>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-base text-foreground">Who&apos;s worked over 40 hours this week?</p>
          <div className="mt-6 flex items-center justify-between gap-3">
            <span className="text-xs text-faint">Answers use St. Mary&apos;s shift records only</span>
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <SendPlaneHorizontalIcon className="size-4" />
            </span>
          </div>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2">
          {STARTERS.map((starter) => (
            <li
              key={starter}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
            >
              {starter}
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-2xl bg-ocean-soft px-5 py-4 text-sm leading-relaxed text-foreground">
          <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-ocean">
            <SparkleAi01Icon className="size-3.5" />
            ShiftBeacon
          </p>
          Only <b className="font-semibold">Dev Kapoor</b>, with 52.4 hours. Everyone else is
          under 40.
          <p className={cn(monoLabelClass, "mt-2.5")}>From shift records · 1 Nov to 7 Nov</p>
        </div>
      </div>
    </section>
  );
}
