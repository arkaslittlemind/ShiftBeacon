import type { Metadata } from "next";
import { Compare } from "@/components/marketing/compare";
import { CtaBand } from "@/components/marketing/cta-band";
import { Features } from "@/components/marketing/features";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Testimonial } from "@/components/marketing/testimonial";
import { TrustBar } from "@/components/marketing/trust-bar";

export const metadata: Metadata = {
  title:
    "ShiftBeacon | Geofenced Clock-In & Attendance Analytics for Care Teams",
  description:
    "ShiftBeacon lets healthcare organizations confirm staff are on-site with geofenced clock-in/out, see who's on shift right now, and track attendance analytics automatically.",
  openGraph: {
    title: "ShiftBeacon - Location-verified shift attendance for care teams",
    description:
      "Geofenced clock-in/out, live staff visibility, and attendance analytics built for healthcare operations.",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <TrustBar />
        <Compare />
        <Features />
        <HowItWorks />
        <Testimonial />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}
