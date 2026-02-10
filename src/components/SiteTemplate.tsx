"use client";

import { useState } from "react";
import { createLead } from "@/actions/leads";

// Import all specialized templates
import {
  RestaurantTemplate,
  HealthcareTemplate,
  FitnessTemplate,
  BeautyTemplate,
  RealEstateTemplate,
  EducationTemplate,
  AgencyTemplate,
  PortfolioTemplate,
  ServiceTemplate,
  EcommerceTemplate,
  StartupTemplate,
} from "@/components/templates";

// No longer need lucide icons here since we removed cart/checkout

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

interface SiteTemplateProps {
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
    // AI-enhanced content from Cohere
    tagline?: string | null;
    valuePropositions?: string[];
    serviceDescriptions?: ServiceDescription[];
  };
  business: {
    name: string;
    description: string | null;
    logo: string | null;
    heroImage: string | null;
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

// Main SiteTemplate component - no cart needed
export function SiteTemplate(props: SiteTemplateProps) {
  return <SiteTemplateRouter {...props} />;
}

// Map business types to templates
function getTemplateForBusinessType(businessType: string) {
  const type = businessType?.toLowerCase() || 'other';
  
  // Restaurant/Food
  if (['restaurant', 'cafe', 'bakery', 'food', 'catering', 'bar', 'pub', 'bistro', 'pizzeria', 'diner'].some(t => type.includes(t))) {
    return 'restaurant';
  }
  
  // Healthcare/Medical
  if (['healthcare', 'medical', 'clinic', 'hospital', 'doctor', 'dentist', 'dental', 'pharmacy', 'health', 'therapy', 'therapist', 'chiropractic', 'wellness'].some(t => type.includes(t))) {
    return 'healthcare';
  }
  
  // Fitness/Gym
  if (['fitness', 'gym', 'yoga', 'pilates', 'crossfit', 'personal training', 'sports', 'martial arts', 'dance'].some(t => type.includes(t))) {
    return 'fitness';
  }
  
  // Beauty/Salon
  if (['beauty', 'salon', 'spa', 'hair', 'nail', 'makeup', 'cosmetic', 'barber', 'skincare', 'esthetician'].some(t => type.includes(t))) {
    return 'beauty';
  }
  
  // Real Estate
  if (['real estate', 'realestate', 'property', 'realtor', 'broker', 'housing', 'apartment', 'rental'].some(t => type.includes(t))) {
    return 'realestate';
  }
  
  // Education
  if (['education', 'school', 'university', 'college', 'training', 'course', 'tutor', 'academy', 'learning', 'coaching'].some(t => type.includes(t))) {
    return 'education';
  }
  
  // Agency/Studio
  if (['agency', 'studio', 'creative', 'design', 'marketing', 'advertising', 'branding', 'digital', 'media'].some(t => type.includes(t))) {
    return 'agency';
  }
  
  // Portfolio/Freelance
  if (['portfolio', 'freelance', 'photographer', 'artist', 'designer', 'developer', 'consultant', 'personal'].some(t => type.includes(t))) {
    return 'portfolio';
  }
  
  // Startup/Tech
  if (['startup', 'tech', 'saas', 'software', 'app', 'platform', 'technology', 'ai', 'fintech'].some(t => type.includes(t))) {
    return 'startup';
  }
  
  // E-commerce/Retail
  if (['ecommerce', 'e-commerce', 'retail', 'shop', 'store', 'boutique', 'fashion', 'clothing', 'jewelry'].some(t => type.includes(t))) {
    return 'ecommerce';
  }
  
  // Default to service provider
  return 'service';
}

// Router component that selects the right template
function SiteTemplateRouter({ site, business, products }: SiteTemplateProps) {
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");

    const result = await createLead({
      siteId: site.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      message: formData.message || undefined,
      variant: site.variant,
    });

    if (result.success) {
      setFormState("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } else {
      setFormState("error");
    }
  };

  const templateType = getTemplateForBusinessType(business.businessType);
  
  // Convert business.openingHours to the right type
  const openingHours = business.openingHours as Record<string, string> | null;

  // Common props for all templates
  const templateProps = {
    site: {
      ...site,
      slug: site.slug,
    },
    business: {
      ...business,
      openingHours,
    },
    products,
    formState,
    formData,
    onFormChange: setFormData,
    onFormSubmit: handleSubmit,
  };

  // Render specialized template based on business type
  switch (templateType) {
    case 'restaurant':
      return <RestaurantTemplate {...templateProps} />;
    case 'healthcare':
      return <HealthcareTemplate {...templateProps} />;
    case 'fitness':
      return <FitnessTemplate {...templateProps} />;
    case 'beauty':
      return <BeautyTemplate {...templateProps} />;
    case 'realestate':
      return <RealEstateTemplate {...templateProps} />;
    case 'education':
      return <EducationTemplate {...templateProps} />;
    case 'agency':
      return <AgencyTemplate {...templateProps} />;
    case 'portfolio':
      return <PortfolioTemplate {...templateProps} />;
    case 'startup':
      return <StartupTemplate {...templateProps} />;
    case 'ecommerce':
      return (
        <EcommerceTemplate
          site={site}
          business={business}
          products={products}
          formState={formState}
          formData={formData}
          onFormChange={setFormData}
          onFormSubmit={handleSubmit}
        />
      );
    default:
      return <ServiceTemplate {...templateProps} />;
  }
}
