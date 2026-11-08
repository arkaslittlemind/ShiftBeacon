import { ManagerSidebarContent } from "@/components/shell/manager-sidebar-content";
import type { CurrentUser } from "@/types/user";

export function ManagerSidebar({
  organizationName,
  user,
}: {
  organizationName: string;
  user: CurrentUser;
}) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-border-soft bg-background md:flex">
      <ManagerSidebarContent organizationName={organizationName} user={user} />
    </aside>
  );
}
