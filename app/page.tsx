import type { Metadata } from "next";
import { AiSection } from "@/components/marketing/ai-section";
import { CtaBand } from "@/components/marketing/cta-band";
import { Faq } from "@/components/marketing/faq";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PlatformBand } from "@/components/marketing/platform-band";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Testimonial } from "@/components/marketing/testimonial";
import { TrustBar } from "@/components/marketing/trust-bar";
import { WhyCards } from "@/components/marketing/why-cards";

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
    <div className="mx-auto w-full max-w-310 border-x border-border-soft bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <TrustBar />
        <HowItWorks />
        <PlatformBand />
        <WhyCards />
        <AiSection />
        <Testimonial />
        <Faq />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
