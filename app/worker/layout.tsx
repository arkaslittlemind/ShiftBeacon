import { WorkerTopNav } from "@/components/shell/worker-top-nav";
import { requireRole } from "@/lib/auth";

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  requireRole("CARE_WORKER");

  return (
    <div className="flex min-h-full flex-col">
      <WorkerTopNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 md:px-10">
        {children}
      </main>
    </div>
  );
}
