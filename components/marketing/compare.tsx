import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHead } from "@/components/marketing/section-head";

const WITHOUT = [
  "Paper sign-in sheets that go missing",
  "No way to confirm a worker was on-site",
  "Hours totalled by hand at month-end",
  "Managers find out about no-shows late",
];

const WITH = [
  "Geofenced clock-in, verified server-side",
  "Live view of who's on shift right now",
  "Hours and attendance calculated automatically",
  "Full shift history with timestamps and notes",
];

export function Compare() {
  return (
    <section id="compare" className="bg-secondary py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <SectionHead
          title="Attendance tracking, without the paper trail"
          description="Manual sign-in sheets and honesty-system timesheets don't hold up when hours and location matter."
        />
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6.5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide uppercase">
              Without ShiftBeacon
            </h3>
            <ul className="flex flex-col gap-3">
              {WITHOUT.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center border-2 border-border bg-danger-soft text-destructive">
                    <X className="size-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="bg-accent p-6.5 shadow-lg">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide uppercase">
              With ShiftBeacon
            </h3>
            <ul className="flex flex-col gap-3">
              {WITH.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center border-2 border-border bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
