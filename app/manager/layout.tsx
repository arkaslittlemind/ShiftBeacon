import { ForbiddenState } from "@/components/shared/forbidden-state";
import { ManagerSidebar } from "@/components/shell/manager-sidebar";
import { ManagerTopbar } from "@/components/shell/manager-topbar";
import { getCurrentDbUser, requireRole } from "@/lib/auth";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const { status, user } = await requireRole("MANAGER", "/manager/dashboard");
  const dbUser = await getCurrentDbUser();
  const organizationName = dbUser!.organization.name;

  return (
    <div className="flex min-h-full">
      <ManagerSidebar organizationName={organizationName} />
      <div className="flex flex-1 flex-col">
        <ManagerTopbar user={user} organizationName={organizationName} />
        <main className="flex-1 px-4 py-7 sm:px-6 lg:px-8">
          {status === "forbidden" ? <ForbiddenState role={user.role} /> : children}
        </main>
      </div>
    </div>
  );
}
