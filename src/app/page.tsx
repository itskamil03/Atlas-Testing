import Features from "@/components/features-1";
import FooterSection from "@/components/footer";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integrations-4";
import Pricing from "@/components/pricing";
import StatsSection from "@/components/stats-2";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <HeroSection/>
      <Features/>
      <IntegrationsSection/>
      <StatsSection/>
      <Pricing/>
      <FooterSection/>
    </div>
  );
}
