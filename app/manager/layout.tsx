import { ManagerSidebar } from "@/components/shell/manager-sidebar";
import { ManagerTopbar } from "@/components/shell/manager-topbar";
import { requireRole } from "@/lib/auth";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  requireRole("MANAGER");

  return (
    <div className="flex min-h-full">
      <ManagerSidebar />
      <div className="flex flex-1 flex-col">
        <ManagerTopbar />
        <main className="flex-1 px-8 py-7">{children}</main>
      </div>
    </div>
  );
}
