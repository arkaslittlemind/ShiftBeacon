import { ChevronDownIcon } from "@/components/icons";
import { SectionHead } from "@/components/marketing/section-head";
import { cn, focusRingClass } from "@/lib/utils";

const QUESTIONS = [
  {
    question: "Do you track staff location all the time?",
    answer:
      "No. A phone's location is checked only while the page is open, and we save a point only when someone clocks in or out. There is no background tracking.",
  },
  {
    question: "What happens if someone is just outside the perimeter?",
    answer:
      "They see how far away they are, and Clock in unlocks as soon as they're inside. You can widen the radius at any time if your building or car park needs it.",
  },
  {
    question: "What does the AI see?",
    answer:
      "Only shift note text with staff names, emails, and phone numbers removed, plus totals such as hours and counts. Never coordinates. We ask staff not to put residents' names in notes.",
  },
  {
    question: "Do staff need a special device?",
    answer:
      "No. ShiftBeacon runs in the browser on any modern phone, and can be added to the home screen like an app.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      className="scroll-mt-20 border-t border-border-soft px-5 py-20 md:px-10 md:py-28"
    >
      <div className="grid gap-10 md:grid-cols-[1fr_1.7fr] md:gap-16">
        <SectionHead align="left" eyebrow="FAQ" title="Common questions" />
        <div>
          {QUESTIONS.map(({ question, answer }, index) => (
            // Native details: keyboard and screen reader support come for free.
            <details
              key={question}
              open={index === 0}
              className="group border-t border-border-soft last:border-b"
            >
              <summary
                className={cn(
                  "flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-4 text-base font-medium text-foreground [&::-webkit-details-marker]:hidden",
                  focusRingClass
                )}
              >
                {question}
                <ChevronDownIcon
                  aria-hidden
                  className="size-5 shrink-0 text-muted-foreground transition-transform duration-(--dur-base) ease-(--ease-out) group-open:rotate-180"
                />
              </summary>
              <p className="max-w-[60ch] pb-5 text-sm leading-relaxed text-muted-foreground group-open:animate-in group-open:fade-in group-open:duration-(--dur-base)">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
