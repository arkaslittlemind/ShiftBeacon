import { Painting } from "@/components/marketing/painting";
import { SectionHead } from "@/components/marketing/section-head";
import { Avatar } from "@/components/shared/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { monoLabelClass } from "@/lib/utils";
import howArrival from "@/public/images/marketing/how-arrival.jpg";
import howPerimeter from "@/public/images/marketing/how-perimeter.jpg";
import howTeam from "@/public/images/marketing/how-team.jpg";
import type { StaticImageData } from "next/image";

const CARD_SIZES = "(min-width: 1240px) 400px, (min-width: 768px) 33vw, 100vw";

function Step({
  painting,
  crop,
  title,
  description,
  children,
}: {
  painting: StaticImageData;
  crop: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-0 py-0 text-center">
      <div className="relative grid h-50 place-items-center">
        <Painting src={painting} alt="" sizes={CARD_SIZES} className={crop} />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-transparent from-40% to-card/55"
        />
        {/* The mini UI is an illustration of the product, not a control. */}
        <div
          aria-hidden
          className="relative w-60 rounded-[10px] border border-border-soft bg-card px-4 py-3 text-left text-sm shadow-md"
        >
          {children}
        </div>
      </div>
      <div className="px-5 pt-5 pb-6">
        <h3 className="mb-2 font-sans text-lg font-medium text-foreground">{title}</h3>
        <p className="mx-auto max-w-[30ch] text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </Card>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 px-5 py-20 md:px-10 md:py-28">
      <SectionHead
        eyebrow="How it works"
        title="Three steps between you and a calmer shift."
        className="mb-14"
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Step
          painting={howPerimeter}
          crop="object-[50%_40%]"
          title="Set your perimeter"
          description="Set your workplace's coordinates and choose how close staff must be to clock in."
        >
          <p className={monoLabelClass}>Clock-in radius</p>
          <p className="mt-1 font-mono">150 m</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 flex-1 rounded-full bg-chart-3">
              <div className="h-full w-[35%] rounded-full bg-ocean" />
            </div>
            <span className="font-mono text-[11px] text-faint">1 km</span>
          </div>
        </Step>
        <Step
          painting={howTeam}
          crop="object-[50%_100%]"
          title="Add your team"
          description="Staff sign in with email or Google and appear in your staff list."
        >
          {[
            { initials: "SR", name: "Sofia Ruiz" },
            { initials: "TB", name: "Tomás Barros" },
          ].map((person) => (
            <div
              key={person.initials}
              className="flex items-center gap-2 border-border-soft py-1.5 [&+&]:border-t"
            >
              <Avatar initials={person.initials} className="size-6.5 text-[11px]" />
              {person.name}
              <Badge variant="success" className="ml-auto">
                Joined
              </Badge>
            </div>
          ))}
        </Step>
        <Step
          painting={howArrival}
          crop="object-[50%_60%]"
          title="Clock in on arrival"
          description="One tap at the door, and they appear on your dashboard straight away."
        >
          <p className={monoLabelClass}>Clocked in</p>
          <p className="mt-1 font-mono">06:58 · inside, 42 m</p>
          <div className="mt-2">
            <Badge variant="success" dot>
              On shift
            </Badge>
          </div>
        </Step>
      </div>
    </section>
  );
}
