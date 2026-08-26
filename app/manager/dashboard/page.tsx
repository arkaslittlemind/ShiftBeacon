import { Users } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function ManagerDashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Manager"
        title="Dashboard"
        description="Live staff view and attendance analytics"
      />
      <EmptyState
        icon={Users}
        title="Staff data is coming soon"
        description="Currently-clocked-in staff, shift history, and attendance analytics will appear here in a later feature."
      />
    </>
  );
}
