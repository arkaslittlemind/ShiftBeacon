import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function Hero() {
  return (
    <section className="overflow-hidden py-16 md:py-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1fr_0.95fr] md:items-center md:px-10">
        <div>
          <span className="mb-5 inline-flex items-center gap-2 rounded-md border-2 border-border bg-accent px-3.5 py-1.5 text-xs font-bold tracking-wide text-accent-foreground uppercase">
            <span className="size-1.5 bg-accent-foreground" />
            Built for healthcare operations
          </span>
          <h1 className="mb-4 text-4xl leading-[1.08] font-bold tracking-tight md:text-5xl">
            Know exactly who&apos;s{" "}
            <span className="text-accent-dark">on-site</span>, the moment
            they clock in.
          </h1>
          <p className="mb-7 max-w-[46ch] text-base text-muted-foreground md:text-lg">
            ShiftBeacon confirms care workers are physically at the workplace
            before they can clock in, then gives managers live staff
            visibility and attendance analytics automatically - no
            spreadsheets, no guesswork.
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <Button size="lg" asChild>
              <a href="#demo">Request a demo</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
          <p className="mt-3 text-xs text-faint">
            No credit card needed &middot; Set up a workplace in minutes
          </p>
        </div>

        <div className="relative hidden h-[420px] md:block" aria-hidden="true">
          <Card className="absolute top-2.5 left-2.5 w-[230px] shadow-lg">
            <div className="flex items-center gap-2.5 px-4">
              <div className="flex size-7.5 shrink-0 items-center justify-center border-2 border-border bg-primary text-sm font-bold text-primary-foreground">
                &#10003;
              </div>
              <strong className="text-sm">Inside perimeter</strong>
            </div>
            <p className="px-4 text-xs text-muted-foreground">
              Riverside Care Home &middot; clocked in 08:02
            </p>
          </Card>

          <Card className="absolute bottom-15 left-10 w-[190px] shadow-lg">
            <div className="px-4">
              <div className="mb-1.5 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                Avg. hours / day
              </div>
              <div className="font-heading text-2xl font-bold">7.6h</div>
              <div className="mt-2.5 flex h-6.5 items-end gap-1">
                {[40, 55, 48, 80, 62, 100].map((h, i) => (
                  <span
                    key={i}
                    className={`flex-1 border border-border ${
                      h >= 80 ? "bg-primary" : "bg-secondary"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </Card>

          <Card className="absolute top-22.5 right-0 w-[220px] shadow-lg">
            <div className="flex flex-col gap-1.5 px-4">
              {[
                { initials: "PN", name: "Priya Nair", time: "2h 21m" },
                { initials: "TO", name: "Tunde Okafor", time: "2h 05m" },
                { initials: "EV", name: "Elena Voss", time: "3h 36m" },
              ].map((person) => (
                <div key={person.initials} className="flex items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center border-2 border-border bg-primary text-[11px] font-bold text-primary-foreground">
                    {person.initials}
                  </div>
                  <span className="text-[13px] font-semibold">{person.name}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    {person.time}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <div className="absolute right-7.5 bottom-0 flex h-[150px] w-[210px] items-center justify-center border-(length:--border-w) border-border bg-accent shadow-lg">
            <div className="flex size-22.5 items-center justify-center rounded-full border-[3px] border-dashed border-border">
              <span className="size-3.5 border-2 border-border bg-primary" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
