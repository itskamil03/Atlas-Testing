import Features from "@/components/features-1";
import FooterSection from "@/components/footer";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integrations-4";
import Pricing from "@/components/pricing";
import WhyChooseAtlas from "@/components/why-choose-atlas";
import FAQSection from "@/components/faq";
import PerformanceSection from "@/components/performance-section";
import LiveStatsBar from "@/components/live-stats-bar";
import AboutUs from "@/components/about-us";
import Academy from "@/components/academy";
import ContactSection from "@/components/contact";
import MarketTicker from "@/components/market-ticker";
import Testimonials from "@/components/testimonials";
import IndiaAnimatedMap from "@/components/india-animated-map";
import SectionReveal from "@/components/ui/section-reveal";

export default function Home() {
  return (
    <div>
      {/* <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 px-4 py-3">
        <p className="text-center text-sm font-semibold text-amber-900 dark:text-amber-100">
          🚧 This site is currently under construction. We're building something amazing for you!
        </p>
      </div> */}
      <HeroSection />
      {/* <SectionReveal animation="slide-up"> */}
        <PerformanceSection />
        <Features />
        <Academy />
      <SectionReveal animation="zoom">
        <Pricing />
      </SectionReveal>
      <SectionReveal animation="zoom">
        <AboutUs />
      </SectionReveal>
      <SectionReveal animation="slide-right">
        <LiveStatsBar />
      </SectionReveal>
      <SectionReveal animation="zoom">
        <Testimonials />
      </SectionReveal>
      <SectionReveal animation="fade">
        <WhyChooseAtlas />
      </SectionReveal>
      <SectionReveal animation="fade">
        <FAQSection />
      </SectionReveal>
      <SectionReveal animation="fade">
        <ContactSection />
      </SectionReveal>
    </div>
  );
}