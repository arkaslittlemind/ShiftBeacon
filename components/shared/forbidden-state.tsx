import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types/user";

const AREA: Record<Role, { label: string; href: string }> = {
  CARE_WORKER: { label: "worker", href: "/worker/home" },
  MANAGER: { label: "manager", href: "/manager/dashboard" },
};

export function ForbiddenState({ role }: { role: Role }) {
  const area = AREA[role];

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-12 items-center justify-center border-2 border-border bg-danger-soft text-destructive">
        <ShieldAlert className="size-6" />
      </div>
      <div>
        <h1 className="mb-1.5 text-xl font-bold">You don&apos;t have access to this area</h1>
        <p className="max-w-[46ch] text-sm text-muted-foreground">
          You&apos;re signed in as a {area.label}, so this page isn&apos;t available to you.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button asChild>
          <Link href={area.href}>Back to your {area.label} area</Link>
        </Button>
        <Button asChild variant="outline">
          <a href="/auth/logout">Log out</a>
        </Button>
      </div>
    </div>
  );
}
