import { AlertTriangle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { eyebrowClass } from "@/lib/utils";
import { getLatestHandoverDigest } from "@/lib/services/handover-service";
import type { HandoverDigestResult } from "@/types/handover";

function formatDayLabel(date: string): string {
  // Day keys are UTC, so the formatter has to be too, or the label can name
  // the day before the one the digest actually covers.
  return new Date(`${date}T00:00:00.000Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

function CardShell({
  subtitle,
  children,
}: {
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={eyebrowClass}>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="size-3.5" aria-hidden />
            Shift handover digest
          </span>
        </CardTitle>
        {subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function HandoverDigestCardSkeleton() {
  return (
    <CardShell subtitle="Summarizing the latest handover notes">
      <div className="space-y-2" aria-hidden>
        <div className="h-3 w-full bg-secondary" />
        <div className="h-3 w-11/12 bg-secondary" />
        <div className="h-3 w-3/5 bg-secondary" />
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
    <CardShell subtitle={`Notes from ${formatDayLabel(result.date)}`}>
      <p className="text-sm">{digest.summary}</p>

      {digest.keyPoints.length > 0 ? (
        <ul className="mt-4 space-y-1.5 text-sm">
          {/* Index keys: the list is static and never reordered, and a model
              can emit the same line twice, which a content key would collide on. */}
          {digest.keyPoints.map((point, index) => (
            <li key={index} className="flex gap-2">
              <span aria-hidden className="text-primary">
                &bull;
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {digest.flags.length > 0 ? (
        <div className="mt-4 border-t-2 border-border-soft pt-3">
          <Badge variant="destructive">
            <AlertTriangle data-icon="inline-start" aria-hidden />
            Needs attention
          </Badge>
          <ul className="mt-2 space-y-1.5 text-sm">
            {digest.flags.map((flag, index) => (
              <li key={index}>{flag}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-muted-foreground">
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
