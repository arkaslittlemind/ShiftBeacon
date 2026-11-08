import { PageHeader } from "@/components/shell/page-header";
import { WorkplaceSettingsForm } from "@/components/manager/workplace-settings-form";
import { requirePageUser } from "@/lib/auth";
import { ManagerViewTracker } from "@/components/observability/manager-view-tracker";

export default async function WorkplacePage() {
  const user = await requirePageUser("MANAGER", "/manager/workplace");
  if (!user) return null;

  return (
    <>
      <ManagerViewTracker view="workplace_settings" />
      <PageHeader
        eyebrow="Workplace settings"
        title="Where your team clocks in"
        description="Staff can only clock in within the radius you set around your workplace. The check happens on our server, so a phone can't fake its position."
      />
      <WorkplaceSettingsForm organization={user.organization} />
    </>
  );
}
