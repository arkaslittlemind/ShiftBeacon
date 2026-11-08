import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkplaceSettingsForm } from "@/components/manager/workplace-settings-form";
import { requirePageUser } from "@/lib/auth";
import { ManagerViewTracker } from "@/components/observability/manager-view-tracker";

export default async function WorkplacePage() {
  const user = await requirePageUser("MANAGER", "/manager/workplace");
  if (!user) return null;
  const organization = user.organization;

  return (
    <>
      <ManagerViewTracker view="workplace_settings" />
      <PageHeader
        eyebrow="Manager"
        title="Workplace"
        description="Your organization's location and clock-in radius"
      />
      <Card>
        <CardHeader>
          <CardTitle>{organization.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkplaceSettingsForm organization={organization} />
        </CardContent>
      </Card>
    </>
  );
}
