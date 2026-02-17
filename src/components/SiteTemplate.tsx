"use client";

import LandingTemplate from "@/components/template/components/landing/LandingTemplate";
import type { BusinessData } from "@/components/template/types/landing";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  salePrice: number | null;
  image: string | null;
  category: string | null;
  featured: boolean;
}

interface Testimonial {
  name: string;
  text: string;
  rating?: number;
}

interface ServiceDescription {
  name: string;
  description: string;
}

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  dribbble?: string;
}

export interface SiteTemplateProps {
  site: {
    id: string;
    slug?: string;
    headline: string;
    subheadline: string | null;
    aboutText: string | null;
    ctaText: string;
    features: string[];
    testimonials: Testimonial[];
    variant: "A" | "B";
    tagline?: string | null;
    valuePropositions?: string[];
    serviceDescriptions?: ServiceDescription[];
  };
  business: {
    name: string;
    description: string | null;
    logo: string | null;
    heroImage: string | null;
    galleryImages: string[];
    primaryColor: string;
    secondaryColor: string;
    businessType: string;
    services: string[];
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    calendlyUrl: string | null;
    socialLinks: SocialLinks | null;
    openingHours: Record<string, string> | null;
  };
  products: Product[];
}

/**
 * Convert props from the DB/page format into the unified BusinessData
 * shape expected by the new LandingTemplate.
 */
function toBusinessData(props: SiteTemplateProps): BusinessData {
  const { site, business, products } = props;

  // Build nav links
  const navLinks: { label: string; href: string }[] = [];
  if (site.aboutText) navLinks.push({ label: "About", href: "#about" });
  if ((site.serviceDescriptions && site.serviceDescriptions.length > 0) || business.services.length > 0)
    navLinks.push({ label: "Services", href: "#services" });
  if (site.features.length > 0) navLinks.push({ label: "Features", href: "#features" });
  if (site.testimonials.length > 0) navLinks.push({ label: "Testimonials", href: "#testimonials" });
  navLinks.push({ label: "Contact", href: "#contact" });

  // Build features from site.features + valuePropositions
  const featureItems = site.features.map((f, i) => ({
    title: f,
    description: site.valuePropositions?.[i] || "",
    icon: ["✦", "◈", "▲", "●", "◆", "■"][i % 6],
  }));

  // Build services from serviceDescriptions or business.services
  const serviceItems =
    site.serviceDescriptions && site.serviceDescriptions.length > 0
      ? site.serviceDescriptions.map((sd) => ({
          title: sd.name,
          description: sd.description,
        }))
      : business.services.map((s) => ({
          title: s,
          description: "",
        }));

  // Build testimonials
  const testimonialItems = site.testimonials.map((t) => ({
    quote: t.text,
    author: t.name,
    role: undefined as string | undefined,
  }));

  // Build footer links from social links
  const socials = business.socialLinks
    ? Object.entries(business.socialLinks)
        .filter(([, href]) => !!href)
        .map(([platform, href]) => ({ platform, href: href as string }))
    : undefined;

  const data: BusinessData = {
    brand: {
      name: business.name,
      logo: business.logo || undefined,
      tagline: site.tagline || business.description || undefined,
    },
    hero: {
      headline: site.headline,
      subheadline: site.subheadline || undefined,
      cta: { label: site.ctaText, href: "#contact" },
      secondaryCta: { label: "Learn More", href: "#about" },
      image: business.heroImage || undefined,
    },
    nav: {
      links: navLinks,
    },
    about: site.aboutText
      ? {
          title: "About Us",
          description: site.aboutText,
        }
      : undefined,
    features:
      featureItems.length > 0
        ? {
            title: "What Sets Us Apart",
            items: featureItems,
          }
        : undefined,
    services:
      serviceItems.length > 0
        ? {
            title: "Our Services",
            items: serviceItems,
          }
        : undefined,
    testimonials:
      testimonialItems.length > 0
        ? {
            title: "What Our Clients Say",
            items: testimonialItems,
          }
        : undefined,
    cta: {
      title: "Ready to get started?",
      description: `Get in touch with ${business.name} today.`,
      buttonLabel: site.ctaText,
      buttonHref: "#contact",
    },
    footer: {
      description: business.description || undefined,
      links: navLinks,
      socials,
      copyright: `© ${new Date().getFullYear()} ${business.name}. All rights reserved.`,
    },
  };

  return data;
}

// Main SiteTemplate component
export function SiteTemplate(props: SiteTemplateProps) {
  const data = toBusinessData(props);
  return <LandingTemplate data={data} />;
}
