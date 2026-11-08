import Link from "next/link";
import { Avatar } from "@/components/shared/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/names";
import { monoLabelClass } from "@/lib/utils";
import { ROLE_LABEL, type Role } from "@/types/user";

const memberSinceFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

type ProfileCardProps = {
  name: string;
  email: string;
  role: Role;
  memberSince: Date;
  organizationName: string;
  clockInRadiusMeters: number;
  workplaceSettingsHref?: string;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border-soft py-3.5 last:border-b-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
      <dt className={monoLabelClass}>{label}</dt>
      <dd className="min-w-0 text-sm wrap-break-word text-foreground">{children}</dd>
    </div>
  );
}

export function ProfileCard({
  name,
  email,
  role,
  memberSince,
  organizationName,
  clockInRadiusMeters,
  workplaceSettingsHref,
}: ProfileCardProps) {
  return (
    <section
      aria-labelledby="profile-name"
      className="max-w-2xl overflow-hidden rounded-[20px] border border-border-soft bg-card shadow-sm"
    >
      <div className="flex items-center gap-4 border-b border-border-soft p-5 sm:p-6">
        <Avatar initials={getInitials(name)} className="size-14 text-base" />
        <div className="min-w-0">
          <h2
            id="profile-name"
            className="font-heading text-2xl leading-tight font-normal wrap-break-word text-foreground"
          >
            {name || "Name not provided"}
          </h2>
          <p className="mt-0.5 text-sm wrap-break-word text-muted-foreground">
            {email || "Email not provided"}
          </p>
          <Badge variant="ocean" className="mt-2">
            {ROLE_LABEL[role]}
          </Badge>
        </div>
      </div>

      <dl className="px-5 sm:px-6">
        <Field label="Member since">{memberSinceFormatter.format(memberSince)}</Field>
        <Field label="Organization">{organizationName}</Field>
        <Field label="Clock-in radius">
          <span className="font-mono tabular-nums">{clockInRadiusMeters} m</span>
        </Field>
      </dl>

      <div className="flex flex-col gap-4 border-t border-border-soft bg-surface-alt px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-muted-foreground">
          Your name and email come from your sign-in provider, so they can&apos;t be edited
          here.
        </p>
        {workplaceSettingsHref && (
          <Button asChild variant="outline" className="h-11 shrink-0 md:h-9">
            <Link href={workplaceSettingsHref}>Edit workplace settings</Link>
          </Button>
        )}
      </div>
    </section>
  );
}
