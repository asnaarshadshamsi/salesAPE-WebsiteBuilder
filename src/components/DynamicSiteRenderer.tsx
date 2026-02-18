"use client";

import React from "react";
import type { BusinessData } from "@/components/template/types/landing";
import type { DesignSystem } from "@/services/design-system-resolver.service";

/* ── Hero variants ───────────────────────────────────── */
import { HeroBackgroundImage } from "@/components/sections/hero/HeroBackgroundImage";
import { HeroSplitLayout } from "@/components/sections/hero/HeroSplitLayout";
import { HeroCentered } from "@/components/sections/hero/HeroCentered";
import { HeroOverlayGradient } from "@/components/sections/hero/HeroOverlayGradient";

/* ── Product variants ────────────────────────────────── */
import { ProductGrid3Col } from "@/components/sections/products/ProductGrid3Col";
import { ProductGrid4Col } from "@/components/sections/products/ProductGrid4Col";

/* ── Old-style sections (SectionProps-based) ─────────── */
import { toSectionPropsDesign, resolveDesignSystem as resolveSectionDS } from "@/components/sections/types";
import type { SectionDesignSystem } from "@/components/sections/types";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ServiceIconGrid } from "@/components/sections/ServiceIconGrid";
import { GallerySection } from "@/components/sections/GallerySection";
import { CTASection } from "@/components/sections/CTASection";
import { BookingSection } from "@/components/sections/BookingSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { ContactSection } from "@/components/sections/ContactSection";

/* ── Shared components ───────────────────────────────── */
import Navbar from "@/components/template/components/landing/Navbar";
import FooterSection from "@/components/template/components/landing/FooterSection";

interface DynamicSiteRendererProps {
  data: BusinessData;
  design: DesignSystem;
  metadata?: {
    brandTone?: string;
    imageUsage?: string;
    textDensity?: string;
  };
}

/** Pick hero variant based on brand tone and available assets */
function pickHeroVariant(tone: string, hasImage: boolean): string {
  if (tone === "luxury" && hasImage) return "background-image";
  if (tone === "bold" && hasImage) return "overlay-gradient";
  if (tone === "minimal") return "split-layout";
  if (tone === "corporate") return "centered";
  if (hasImage) return "background-image";
  return "centered";
}

/** Pick product layout based on count and tone */
function pickProductLayout(count: number, tone: string): string {
  if (tone === "luxury" || count <= 8) return "4col";
  return "3col";
}

/** Get booking title based on business type */
function getBookingTitle(businessType?: string): string {
  const titles: Record<string, string> = {
    ecommerce: "Book a Personal Consultation",
    restaurant: "Reserve Your Table",
    fitness: "Schedule Your First Session",
    healthcare: "Book Your Appointment",
    beauty: "Book Your Beauty Treatment",
    service: "Schedule a Consultation",
    agency: "Book a Strategy Session",
    portfolio: "Schedule a Discovery Call",
    realestate: "Schedule a Property Viewing",
    education: "Schedule a Campus Tour",
  };
  return titles[businessType || "service"] || "Book an Appointment";
}

/** Get booking subtitle based on business type */
function getBookingSubtitle(businessType?: string): string {
  const subtitles: Record<string, string> = {
    ecommerce: "Get personalized recommendations and expert advice. Schedule a consultation to find the perfect products for your needs.",
    restaurant: "Secure your spot for an unforgettable dining experience. Book your table now and let us prepare something special for you.",
    fitness: "Start your fitness journey today. Book a complimentary consultation with our expert trainers to create your personalized plan.",
    healthcare: "Access quality healthcare when you need it. Schedule your appointment with our experienced medical professionals today.",
    beauty: "Treat yourself to professional beauty services. Reserve your appointment and experience luxury and relaxation.",
    service: "Let's discuss your project. Book a free consultation with our experts to explore how we can help achieve your goals.",
    agency: "Transform your brand with our expert team. Schedule a strategy session to discuss your goals and explore creative solutions.",
    portfolio: "Ready to start your project? Book a consultation to discuss your vision and how we can bring it to life.",
    realestate: "Find your dream property. Book a viewing or consultation with our experienced real estate professionals today.",
    education: "Discover our programs and facilities. Book a campus tour or consultation to learn how we can help you achieve your educational goals.",
  };
  return subtitles[businessType || "service"] || "Schedule a time to connect with us and discuss your specific needs.";
}

export function DynamicSiteRenderer({
  data,
  design,
  metadata,
}: DynamicSiteRendererProps) {
  const tone = metadata?.brandTone || "minimal";
  const heroImage = data.hero.image;
  const heroVariant = pickHeroVariant(tone, !!heroImage);
  const productCount = data.products?.items?.length || 0;
  const productLayout = pickProductLayout(productCount, tone);

  /* Build legacy SectionProps design for old-style components */
  const legacyDesign = React.useMemo(() => {
    /* We need a SectionDesignSystem first – build one from resolved DesignSystem */
    const sds: SectionDesignSystem = {
      colors: design.colors,
      typography: {
        fontFamily: design.typography.fontFamily,
        h1: design.typography.h1,
        h2: design.typography.h2,
        h3: design.typography.h3,
        h4: design.typography.h4,
        body: { size: design.typography.body.size, lineHeight: design.typography.body.lineHeight },
        small: { size: design.typography.small.size, weight: design.typography.small.weight },
        caption: { size: design.typography.small.size },
      },
      spacing: design.spacing,
      borderRadius: design.borderRadius,
      shadows: design.shadows,
      animations: {
        duration: design.animations.durations.normal,
        easing: design.animations.easings.easeInOut,
        hover: { scale: 1.03, lift: "-4px" },
      },
    };
    return toSectionPropsDesign(sds);
  }, [design]);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: design.colors.background,
        color: design.colors.foreground,
        fontFamily: design.typography.fontFamily.body,
      }}
    >
      {/* Navigation */}
      <Navbar data={data} />

      <main>
        {/* ── HERO ─────────────────────────────────── */}
        {heroVariant === "background-image" && heroImage && (
          <HeroBackgroundImage
            headline={data.hero.headline}
            subheadline={data.hero.subheadline}
            ctaText={data.hero.cta?.label || "Get Started"}
            ctaLink={data.hero.cta?.href}
            backgroundImage={heroImage}
            designSystem={design}
          />
        )}
        {heroVariant === "split-layout" && (
          <HeroSplitLayout
            headline={data.hero.headline}
            subheadline={data.hero.subheadline}
            ctaText={data.hero.cta?.label || "Get Started"}
            ctaLink={data.hero.cta?.href}
            secondaryCtaText={data.hero.secondaryCta?.label}
            secondaryCtaLink={data.hero.secondaryCta?.href}
            heroImage={heroImage || ""}
            designSystem={design}
          />
        )}
        {heroVariant === "centered" && (
          <HeroCentered
            headline={data.hero.headline}
            subheadline={data.hero.subheadline}
            ctaText={data.hero.cta?.label || "Get Started"}
            ctaLink={data.hero.cta?.href}
            secondaryCtaText={data.hero.secondaryCta?.label}
            secondaryCtaLink={data.hero.secondaryCta?.href}
            designSystem={design}
          />
        )}
        {heroVariant === "overlay-gradient" && (
          <HeroOverlayGradient
            headline={data.hero.headline}
            subheadline={data.hero.subheadline}
            ctaText={data.hero.cta?.label || "Get Started"}
            ctaLink={data.hero.cta?.href}
            backgroundImage={heroImage}
            designSystem={design}
          />
        )}

        {/* ── ABOUT ────────────────────────────────── */}
        {data.about && (
          <section
            id="about"
            style={{ padding: `${design.spacing.section} 0`, backgroundColor: design.colors.muted }}
          >
            <div className="container mx-auto px-4" style={{ maxWidth: design.spacing.container }}>
              <h2
                className="text-center mb-6"
                style={{
                  fontSize: design.typography.h2.size,
                  fontWeight: design.typography.h2.weight,
                  color: design.colors.foreground,
                }}
              >
                {data.about.title || "About Us"}
              </h2>
              <p
                className="text-center mx-auto"
                style={{
                  fontSize: design.typography.body.size,
                  lineHeight: design.typography.body.lineHeight,
                  color: design.colors.mutedForeground,
                  maxWidth: "48rem",
                }}
              >
                {data.about.description}
              </p>
            </div>
          </section>
        )}

        {/* ── SERVICES ─────────────────────────────── */}
        {data.services && data.services.items.length > 0 && (
          <ServiceIconGrid
            design={legacyDesign}
            data={{
              title: data.services.title || "Our Services",
              items: data.services.items.map((s) => ({
                title: s.title,
                description: s.description,
                icon: "✦",
              })),
            }}
          />
        )}

        {/* ── PRODUCTS ─────────────────────────────── */}
        {data.products && data.products.items.length > 0 && (
          productLayout === "4col" ? (
            <ProductGrid4Col
              title={data.products.title}
              subtitle={data.products.subtitle}
              products={data.products.items.map((p, i) => ({
                id: String(i),
                name: p.name || "Product",
                description: p.description || undefined,
                image: p.image || undefined,
                price: p.price ?? undefined,
                salePrice: p.salePrice ?? undefined,
                category: p.category || undefined,
                featured: false,
              }))}
              designSystem={design}
              showAddToCart={false}
            />
          ) : (
            <ProductGrid3Col
              title={data.products.title}
              subtitle={data.products.subtitle}
              products={data.products.items.map((p, i) => ({
                id: String(i),
                name: p.name || "Product",
                description: p.description || undefined,
                image: p.image || undefined,
                price: p.price ?? undefined,
                salePrice: p.salePrice ?? undefined,
                category: p.category || undefined,
                featured: false,
              }))}
              designSystem={design}
              showAddToCart={false}
            />
          )
        )}

        {/* ── TESTIMONIALS ─────────────────────────── */}
        {data.testimonials && data.testimonials.items.length > 0 && (
          <TestimonialsSection
            design={legacyDesign}
            data={{
              title: data.testimonials.title || "What Our Clients Say",
              items: data.testimonials.items,
            }}
          />
        )}

        {/* ── GALLERY ──────────────────────────────── */}
        {data.galleryImages && data.galleryImages.length > 0 && (
          <GallerySection
            design={legacyDesign}
            data={{
              title: "Gallery",
              images: data.galleryImages,
            }}
          />
        )}

        {/* ── BOOKING/APPOINTMENT ──────────────────── */}
        {data.contact?.calendlyUrl && (
          <BookingSection
            title={getBookingTitle(data.brand.businessType)}
            subtitle={getBookingSubtitle(data.brand.businessType)}
            calendlyUrl={data.contact.calendlyUrl}
            phone={data.contact.phone}
            email={data.contact.email}
            businessType={data.brand.businessType}
            designSystem={design}
          />
        )}

        {/* ── CTA ──────────────────────────────────── */}
        {data.cta && (
          <CTASection
            design={legacyDesign}
            data={{
              title: data.cta.title,
              description: data.cta.description,
              buttonLabel: data.cta.buttonLabel,
              buttonHref: data.cta.buttonHref,
            }}
          />
        )}

        {/* ── NEWSLETTER ───────────────────────────── */}
        <NewsletterSection
          design={legacyDesign}
          data={{ title: "Stay Updated", subtitle: `Subscribe to ${data.brand.name} newsletter` }}
        />

        {/* ── FAQ ──────────────────────────────────── */}
        {data.faq && data.faq.length > 0 && (
          <FAQSection
            design={legacyDesign}
            data={{ title: "Frequently Asked Questions", items: data.faq }}
          />
        )}

        {/* ── CONTACT ──────────────────────────────── */}
        {data.contact && (
          <ContactSection
            design={legacyDesign}
            data={{
              title: "Get in Touch",
              email: data.contact.email,
              phone: data.contact.phone,
              address: data.contact.address,
            }}
          />
        )}
      </main>

      {/* Footer */}
      {data.footer && (
        <FooterSection data={data.footer} brandName={data.brand.name} />
      )}
    </div>
  );
}

export default DynamicSiteRenderer;
