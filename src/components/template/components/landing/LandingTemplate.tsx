"use client";

import { BusinessData } from "../../types/landing";
import DynamicThemeProvider from "./DynamicThemeProvider";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import AboutSection from "./AboutSection";
import StatsSection from "./StatsSection";
import TestimonialsSection from "./TestimonialsSection";
import ServicesSection from "./ServicesSection";
import ProductsSection from "./ProductsSection";
import BookingSection from "./BookingSection";
import ContactFormSection from "./ContactFormSection";
import CtaSection from "./CtaSection";
import FooterSection from "./FooterSection";

interface LandingTemplateProps {
  data: BusinessData;
}

const LandingTemplate = ({ data }: LandingTemplateProps) => {
  return (
    <DynamicThemeProvider
      primaryColor={data.brand.primaryColor}
      secondaryColor={data.brand.secondaryColor}
    >
      <div className="min-h-screen bg-background">
        <Navbar data={data} />
        <main>
          <HeroSection data={data.hero} />
          {data.about && <AboutSection data={data.about} />}
          {data.features && <FeaturesSection data={data.features} />}
          {data.stats && <StatsSection data={data.stats} />}
          {data.products && <ProductsSection data={data.products} />}
          {data.services && <ServicesSection data={data.services} businessType={data.brand.businessType} />}
          {data.testimonials && <TestimonialsSection data={data.testimonials} />}
          {data.contact?.calendlyUrl && (
            <BookingSection
              calendlyUrl={data.contact.calendlyUrl}
              phone={data.contact.phone}
              email={data.contact.email}
              businessType={data.brand.businessType}
              businessName={data.brand.name}
            />
          )}
          {data.contact && (
            <ContactFormSection
              email={data.contact.email}
              phone={data.contact.phone}
              address={data.contact.address}
              businessName={data.brand.name}
              businessType={data.brand.businessType}
            />
          )}
          {data.cta && <CtaSection data={data.cta} />}
        </main>
        {data.footer && (
          <FooterSection 
            data={data.footer} 
            brandName={data.brand.name} 
            contact={data.contact}
          />
        )}
      </div>
    </DynamicThemeProvider>
  );
};

export default LandingTemplate;
