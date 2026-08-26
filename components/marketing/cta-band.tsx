import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section id="demo" className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-7.5 rounded-md border-(length:--border-w) border-border bg-foreground px-8 py-11 text-background shadow-lg md:px-15">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-background">
              See ShiftBeacon on your own workplace data
            </h2>
            <p className="text-sm text-faint">
              Book a walkthrough and we&apos;ll help you set up your first
              location.
            </p>
          </div>
          <Button size="lg" className="border-background" asChild>
            <a href="#demo">Request a demo</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
