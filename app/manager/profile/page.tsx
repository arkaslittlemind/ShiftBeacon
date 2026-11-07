import { PageHeader } from "@/components/shell/page-header";
import { ProfileCard } from "@/components/shared/profile-card";
import { getCurrentDbUser } from "@/lib/auth";

export default async function ManagerProfilePage() {
  const user = await getCurrentDbUser();

  return (
    <>
      <PageHeader eyebrow="Manager" title="Profile" description="Your account and workplace" />
      <ProfileCard
        name={user!.name}
        email={user!.email}
        role={user!.role}
        memberSince={user!.createdAt}
        organizationName={user!.organization.name}
        clockInRadiusMeters={user!.organization.clockInRadiusMeters}
        workplaceSettingsHref="/manager/workplace"
      />
    </>
  );
}
