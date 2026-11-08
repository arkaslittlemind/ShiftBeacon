import Link from "next/link";
import { ShieldIcon } from "@/components/icons";
import { StatePanel } from "@/components/shared/state-panel";
import { LogoutLink } from "@/components/shell/logout-link";
import { Button } from "@/components/ui/button";
import { touchTargetClass } from "@/lib/utils";
import type { Role } from "@/types/user";

const AREA: Record<Role, { label: string; href: string }> = {
  CARE_WORKER: { label: "worker", href: "/worker/home" },
  MANAGER: { label: "manager", href: "/manager/dashboard" },
};

export function ForbiddenState({ role }: { role: Role }) {
  const area = AREA[role];

  return (
    <StatePanel
      icon={ShieldIcon}
      tone="danger"
      title="You don't have access to this area"
      description={`You're signed in as a ${area.label}, so this page isn't available to you.`}
    >
      <Button asChild className={touchTargetClass}>
        <Link href={area.href}>Back to your {area.label} area</Link>
      </Button>
      <Button asChild variant="outline" className={touchTargetClass}>
        <LogoutLink>Log out</LogoutLink>
      </Button>
    </StatePanel>
  );
}
