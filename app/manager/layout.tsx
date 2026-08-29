import { ForbiddenState } from "@/components/shared/forbidden-state";
import { ManagerSidebar } from "@/components/shell/manager-sidebar";
import { ManagerTopbar } from "@/components/shell/manager-topbar";
import { requireRole } from "@/lib/auth";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const { status, user } = await requireRole("MANAGER", "/manager/dashboard");

  return (
    <div className="flex min-h-full">
      <ManagerSidebar />
      <div className="flex flex-1 flex-col">
        <ManagerTopbar user={user} />
        <main className="flex-1 px-8 py-7">
          {status === "forbidden" ? <ForbiddenState role={user.role} /> : children}
        </main>
      </div>
    </div>
  );
}
