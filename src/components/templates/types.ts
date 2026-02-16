// Shared types for all templates

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  salePrice: number | null;
  image: string | null;
  category: string | null;
  featured: boolean;
}

export interface Testimonial {
  name: string;
  text: string;
  rating?: number;
}

export interface ServiceDescription {
  name: string;
  description: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  github?: string;
  dribbble?: string;
}

export interface SiteData {
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
}

export interface BusinessData {
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
}

export interface TemplateProps {
  site: SiteData;
  business: BusinessData;
  products: Product[];
  formState: "idle" | "loading" | "success" | "error";
  formData: {
    name: string;
    email: string;
    phone: string;
    message: string;
  };
  onFormChange: (data: { name: string; email: string; phone: string; message: string }) => void;
  onFormSubmit: (e: React.FormEvent) => void;
}
