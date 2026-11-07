import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Role } from "@/types/user";

const ROLE_LABEL: Record<Role, string> = {
  CARE_WORKER: "Care worker",
  MANAGER: "Manager",
};

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
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="w-32 shrink-0 font-heading text-xs font-bold tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="min-w-0 break-words font-medium">{children}</dd>
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
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4">
            <Field label="Name">{name || "Not provided"}</Field>
            <Field label="Email">{email || "Not provided"}</Field>
            <Field label="Role">
              <Badge>{ROLE_LABEL[role]}</Badge>
            </Field>
            <Field label="Member since">{memberSinceFormatter.format(memberSince)}</Field>
          </dl>
          <p className="mt-5 text-xs text-muted-foreground">
            Your name and email come from your sign-in provider, so they can&apos;t be
            edited here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workplace</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4">
            <Field label="Organization">{organizationName}</Field>
            <Field label="Clock-in radius">{clockInRadiusMeters} m</Field>
          </dl>
          {workplaceSettingsHref && (
            <Button asChild variant="outline" className="mt-5">
              <Link href={workplaceSettingsHref}>Edit workplace settings</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
