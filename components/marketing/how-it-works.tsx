import { SectionHead } from "@/components/marketing/section-head";

const STEPS = [
  {
    title: "Configure your workplace",
    description:
      "Set the address and clock-in radius for each location your team works from.",
  },
  {
    title: "Invite your team",
    description:
      "Care workers sign in with Google, email, or username/password via Auth0.",
  },
  {
    title: "Track attendance automatically",
    description:
      "Clock-ins, clock-outs, and analytics flow into your dashboard with no extra work.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-secondary py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <SectionHead
          title="Set up in three steps"
          description="No hardware, no badges - just a location and a browser."
        />
        <div className="grid gap-7.5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title}>
              <div className="mb-4 flex size-7.5 items-center justify-center border-2 border-border bg-primary font-heading text-[13px] font-bold text-primary-foreground">
                {i + 1}
              </div>
              <h3 className="mb-2 text-base font-bold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
