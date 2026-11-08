import { Avatar } from "@/components/shared/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getInitials } from "@/lib/names";
import { monoLabelClass } from "@/lib/utils";
import { ROLE_LABEL, type Role } from "@/types/user";

const joinedFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function StaffProfileCard({
  name,
  email,
  role,
  joinedAt,
  onShiftFor,
}: {
  name: string;
  email: string;
  role: Role;
  joinedAt: Date;
  /** Formatted time on the current shift, or null when off shift. */
  onShiftFor: string | null;
}) {
  return (
    <Card className="flex-row flex-wrap items-center gap-5 px-5 py-5 sm:px-6">
      <Avatar initials={getInitials(name)} className="size-18 text-xl" />
      <div className="min-w-0 flex-1">
        <p className={monoLabelClass}>{ROLE_LABEL[role]}</p>
        <h1 className="font-heading text-[2.4rem] leading-[1.05] font-normal tracking-tight wrap-break-word text-foreground md:text-[2.75rem]">
          {name || "Name not provided"}
        </h1>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {onShiftFor ? (
            <Badge variant="success" dot>
              On shift · {onShiftFor}
            </Badge>
          ) : (
            <Badge variant="neutral">Off shift</Badge>
          )}
          <span className="wrap-break-word">{email || "Email not provided"}</span>
          <span>Joined {joinedFormatter.format(joinedAt)}</span>
        </div>
      </div>
    </Card>
  );
}
