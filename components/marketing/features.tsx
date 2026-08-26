import { BarChart3, FileText, Lock, MapPin, Users, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHead } from "@/components/marketing/section-head";

const FEATURES = [
  {
    icon: MapPin,
    title: "Geofenced clock-in",
    description:
      "Workers can only clock in from inside the workplace perimeter you configure - validated on the server, not just the app.",
  },
  {
    icon: Users,
    title: "Live staff visibility",
    description:
      "See who's currently on shift, when they clocked in, and where - updated in real time on the manager dashboard.",
  },
  {
    icon: BarChart3,
    title: "Attendance analytics",
    description:
      "Average hours per day, daily clock-in counts, and 7-day totals per staff member - calculated automatically from shift records.",
  },
  {
    icon: Lock,
    title: "Secure, role-based access",
    description:
      "Auth0-backed sign-in with Google, email, or username/password, and role-based permissions for workers vs managers.",
  },
  {
    icon: FileText,
    title: "Optional shift notes",
    description:
      "Workers can leave a quick note on clock-in or clock-out - handoff details, incidents, or context for the next shift.",
  },
  {
    icon: Zap,
    title: "Works on any device",
    description:
      "A responsive web app today, with an installable PWA experience on the roadmap for one-tap access at the workplace.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <SectionHead
          title="Everything a care operations team needs"
          description="One simple flow for workers, complete visibility for managers."
        />
        <div className="grid gap-5.5 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="p-6.5">
              <div className="mb-4 flex size-10.5 items-center justify-center border-2 border-border bg-primary text-primary-foreground">
                <Icon className="size-5" />
              </div>
              <h3 className="mb-2 text-base font-bold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
