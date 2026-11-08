import { ArrowRightIcon, CheckTickCircleIcon, MapPinIcon } from "@/components/icons";
import { GlassFrame } from "@/components/marketing/glass-frame";
import { Painting } from "@/components/marketing/painting";
import { Avatar } from "@/components/shared/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { monoLabelClass } from "@/lib/utils";
import hero from "@/public/images/marketing/hero.jpg";

// One-time entrance for first-view content: opacity plus an 8px rise, staggered
// 60ms. The global reduced-motion rule drops the rise and keeps the fade.
const ENTER =
  "animate-in fade-in slide-in-from-bottom-2 duration-(--dur-panel) ease-(--ease-out) fill-mode-backwards";

const ASSURANCES = ["Works on any phone", "No hardware to install"];

const ON_SHIFT = [
  { initials: "AM", name: "Amara Mensah", since: "06:58" },
  { initials: "JL", name: "Jonah Lee", since: "07:04" },
  { initials: "SR", name: "Sofia Ruiz", since: "08:30" },
  { initials: "TB", name: "Tomás Barros", since: "09:01" },
];

export function Hero() {
  return (
    <section className="grid md:min-h-200 md:grid-cols-2">
      <div className="flex flex-col justify-center px-5 py-14 md:px-10 md:py-20">
        <h1
          className={`font-heading text-[clamp(3rem,5.4vw,4.6rem)] leading-[1.04] font-normal tracking-tight text-foreground ${ENTER}`}
        >
          Know exactly who&apos;s on shift, and where.
        </h1>
        <p
          className={`mt-5 max-w-[31rem] text-lg leading-relaxed text-muted-foreground md:text-xl ${ENTER} [animation-delay:60ms]`}
        >
          ShiftBeacon lets care workers clock in only from inside your workplace, and shows
          managers who&apos;s on the floor, for how long, and what the last shift handed over.
        </p>
        <Button
          asChild
          size="lg"
          className={`mt-8 w-fit ${ENTER} [animation-delay:120ms]`}
        >
          <a href="#demo">
            Request a demo
            <ArrowRightIcon aria-hidden />
          </a>
        </Button>
        <ul
          className={`mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground ${ENTER} [animation-delay:180ms]`}
        >
          {ASSURANCES.map((text) => (
            <li key={text} className="inline-flex items-center gap-2">
              <span className="grid size-5.5 place-items-center rounded-full bg-success-soft text-success">
                <CheckTickCircleIcon aria-hidden className="size-3.5" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex flex-col gap-4 overflow-hidden px-4 pt-72 pb-6 md:block md:p-0">
        <Painting
          src={hero}
          alt="A care worker in a blue tunic walks up a lavender-lined path to a white seaside care home at sunrise"
          sizes="(min-width: 1240px) 620px, (min-width: 768px) 50vw, 100vw"
          priority
          className="object-[88%_50%] md:object-[50%_50%]"
        />

        <div aria-hidden className="contents">
          <GlassFrame
            className={`md:absolute md:top-[14%] md:left-[7%] md:w-75 ${ENTER} [animation-delay:240ms]`}
          >
            <p className={`${monoLabelClass} flex items-center gap-2 text-foreground`}>
              <span className="size-1.75 rounded-full bg-success" />
              Location check
            </p>
            <p className={`${monoLabelClass} mt-3 mb-1.5`}>Workplace</p>
            <div className="flex h-9.5 items-center gap-2 rounded-full border border-border bg-surface-alt px-3 font-mono text-xs text-foreground">
              <MapPinIcon className="size-3.75 text-ocean" />
              St. Mary&apos;s Care Home
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border-soft pt-3 text-xs text-success">
              <span className="inline-flex items-center gap-1.5">
                <CheckTickCircleIcon className="size-3.5" />
                Inside · 42 m
              </span>
              <span className="inline-flex h-8 items-center rounded-lg bg-ocean px-3.5 text-xs font-semibold text-primary-foreground">
                Clock in
              </span>
            </div>
          </GlassFrame>

          <GlassFrame
            className={`md:absolute md:bottom-[7%] md:left-[5%] md:w-100 ${ENTER} [animation-delay:300ms]`}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <p>
                <b className="block text-base font-medium text-foreground">On shift now</b>
                <small className="text-xs text-faint">14 of 17 staff</small>
              </p>
              <Badge variant="success" dot>
                14 on shift
              </Badge>
            </div>
            <div className={`grid grid-cols-[30px_1fr_auto_auto] gap-3 pb-1.5 ${monoLabelClass}`}>
              <span />
              <span>Staff</span>
              <span>In</span>
              <span>Status</span>
            </div>
            {ON_SHIFT.map((person) => (
              <div
                key={person.initials}
                className="grid grid-cols-[30px_1fr_auto_auto] items-center gap-3 border-t border-border-soft py-2.5 text-sm"
              >
                <Avatar initials={person.initials} className="size-7.5 text-[11px]" />
                <span className="min-w-0 truncate text-foreground">
                  {person.name}
                  <small className="block text-xs text-faint">Care worker</small>
                </span>
                <span className="font-mono text-xs text-muted-foreground">{person.since}</span>
                <Badge variant="success">On shift</Badge>
              </div>
            ))}
          </GlassFrame>
        </div>
      </div>
    </section>
  );
}
