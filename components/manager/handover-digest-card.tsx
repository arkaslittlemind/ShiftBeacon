import { AlertTriangleIcon, CheckTickCircleIcon, SparkleAi01Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimeOfDay } from "@/lib/time-of-day";
import { cardTitleClass, monoLabelClass } from "@/lib/utils";
import { getLatestHandoverDigest } from "@/lib/services/handover-service";
import type { HandoverDigestResult } from "@/types/handover";

// Day keys are UTC, so the formatter has to be too, or the label can name the
// day before the one the digest actually covers.
const dayLabelFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function formatDayLabel(date: string): string {
  return dayLabelFormatter.format(new Date(`${date}T00:00:00.000Z`));
}

function CardShell({ meta, children }: { meta?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className={cardTitleClass}>
            <SparkleAi01Icon aria-hidden className="size-4.5" />
            Handover digest
          </CardTitle>
          <Badge variant="ocean">AI</Badge>
        </div>
        {meta ? <p className={monoLabelClass}>{meta}</p> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function HandoverDigestCardSkeleton() {
  return (
    <CardShell meta="Summarizing the latest handover notes">
      <div className="space-y-2.5" aria-hidden>
        <div className="h-3 w-full rounded-full bg-surface-alt" />
        <div className="h-3 w-11/12 rounded-full bg-surface-alt" />
        <div className="h-3 w-3/5 rounded-full bg-surface-alt" />
      </div>
      <p className="sr-only" role="status">
        Generating the shift handover digest
      </p>
    </CardShell>
  );
}

export function HandoverDigestCard({ result }: { result: HandoverDigestResult }) {
  if (result.status === "empty") {
    return (
      <CardShell>
        <p className="text-sm text-muted-foreground">
          No handover notes have been recorded yet. Notes staff add when they
          clock in or out are summarized here.
        </p>
      </CardShell>
    );
  }

  if (result.status === "unavailable") {
    return (
      <CardShell>
        <p className="text-sm text-muted-foreground">
          The digest is unavailable right now. Shift notes are still recorded as
          normal and can be read on each staff member&apos;s page.
        </p>
      </CardShell>
    );
  }

  const { digest } = result;

  return (
    <CardShell
      meta={`${formatDayLabel(result.date)} · generated ${formatTimeOfDay(result.generatedAt)}`}
    >
      <p className="text-sm leading-relaxed text-foreground">{digest.summary}</p>

      {digest.keyPoints.length > 0 ? (
        <ul className="mt-4 space-y-2.5 text-sm">
          {/* Index keys: the list is static and never reordered, and a model
              can emit the same line twice, which a content key would collide on. */}
          {digest.keyPoints.map((point, index) => (
            <li key={index} className="flex gap-2.5">
              <CheckTickCircleIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-ocean" />
              <span className="text-muted-foreground">{point}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {digest.flags.length > 0 ? (
        <div className="mt-4 rounded-xl bg-warning-soft px-3.5 py-3 text-sm text-warning">
          <p className="flex items-center gap-2 font-semibold">
            <AlertTriangleIcon aria-hidden className="size-4 shrink-0" />
            Needs attention
          </p>
          <ul className="mt-1.5 space-y-1.5 pl-6">
            {digest.flags.map((flag, index) => (
              <li key={index}>{flag}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-faint">
        AI generated from staff notes. Check anything you plan to act on.
      </p>
    </CardShell>
  );
}

// organizationId comes from the caller's authenticated session, never from a
// prop the client could set. Kept behind Suspense by the page so a slow vendor
// delays only this card.
export async function HandoverDigestSection({
  organizationId,
}: {
  organizationId: string;
}) {
  return <HandoverDigestCard result={await getLatestHandoverDigest(organizationId)} />;
}
