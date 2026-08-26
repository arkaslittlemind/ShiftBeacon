import { ManagerSidebarContent } from "@/components/shell/manager-sidebar-content";

export function ManagerSidebar() {
  return (
    <aside className="hidden w-55 shrink-0 border-r-(length:--border-w-lg) border-border bg-foreground text-background md:flex">
      <ManagerSidebarContent />
    </aside>
  );
}
