"use client";

import { BusinessData } from "../../types/landing";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import AboutSection from "./AboutSection";
import StatsSection from "./StatsSection";
import TestimonialsSection from "./TestimonialsSection";
import ServicesSection from "./ServicesSection";
import CtaSection from "./CtaSection";
import FooterSection from "./FooterSection";

interface LandingTemplateProps {
  data: BusinessData;
}

const LandingTemplate = ({ data }: LandingTemplateProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar data={data} />
      <main>
        <HeroSection data={data.hero} />
        {data.about && <AboutSection data={data.about} />}
        {data.features && <FeaturesSection data={data.features} />}
        {data.stats && <StatsSection data={data.stats} />}
        {data.services && <ServicesSection data={data.services} />}
        {data.testimonials && <TestimonialsSection data={data.testimonials} />}
        {data.cta && <CtaSection data={data.cta} />}
      </main>
      {data.footer && (
        <FooterSection data={data.footer} brandName={data.brand.name} />
      )}
    </div>
  );
};

export default LandingTemplate;
