import { ForbiddenState } from "@/components/shared/forbidden-state";
import { WorkerTopNav } from "@/components/shell/worker-top-nav";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import { AnalyticsIdentity } from "@/components/observability/analytics-identity";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const { status, user } = await requireRole("CARE_WORKER", "/worker/home");
  const dbUser = await getCurrentDbUser();

  return (
    <div className="flex min-h-full flex-col">
      <AnalyticsIdentity
        id={dbUser!.id}
        role={dbUser!.role}
        organizationId={dbUser!.organizationId}
      />
      <WorkerTopNav user={user} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 md:px-10">
        {status === "forbidden" ? <ForbiddenState role={user.role} /> : children}
      </main>
    </div>
  );
}
