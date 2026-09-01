import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkplaceSettingsForm } from "@/components/manager/workplace-settings-form";
import { getCurrentDbUser } from "@/lib/auth";

export default async function WorkplacePage() {
  const user = await getCurrentDbUser();
  const organization = user!.organization;

  return (
    <>
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
