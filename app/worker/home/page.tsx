import { Clock } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function WorkerHomePage() {
  return (
    <>
      <PageHeader
        eyebrow="Worker"
        title="Home"
        description="Riverside Care Home"
      />
      <EmptyState
        icon={Clock}
        title="Clock-in is coming soon"
        description="Location-checked clock-in, shift duration, and your shift history will appear here in a later feature."
      />
    </>
  );
}
