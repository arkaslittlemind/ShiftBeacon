import { ArrowRightIcon } from "@/components/icons";
import { sectionTitleClass } from "@/components/marketing/section-head";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CtaBand() {
  return (
    <section
      id="demo"
      className="dot-grid scroll-mt-20 border-t border-border-soft px-5 py-24 text-center md:px-10 md:py-32"
    >
      <h2 className={cn(sectionTitleClass, "mx-auto max-w-2xl text-foreground")}>
        Clocking in is now simpler than ever.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-[1.0625rem]">
        We&apos;ll set up your workplace with you and have your team clocking in by the end of the
        call.
      </p>
      <Button asChild size="lg" className="mt-8">
        <a href="#demo">
          Request a demo
          <ArrowRightIcon aria-hidden />
        </a>
      </Button>
    </section>
  );
}
