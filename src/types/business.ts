import { SocialLinks, Testimonial } from './social';
import { LeadFormField } from './lead';
import { ProductData } from './product';

export type BusinessType = 
  | 'ecommerce' 
  | 'restaurant' 
  | 'service' 
  | 'portfolio' 
  | 'agency' 
  | 'healthcare' 
  | 'fitness' 
  | 'beauty' 
  | 'realestate' 
  | 'education' 
  | 'startup'
  // Extended business types
  | 'perfume'
  | 'flowershop'
  | 'cafe'
  | 'spa'
  | 'jewelry'
  | 'photography'
  | 'barbershop'
  | 'cleaning'
  | 'petcare'
  | 'law'
  | 'accounting'
  | 'dental'
  | 'hotel'
  | 'events'
  | 'catering'
  | 'tech'
  | 'consulting'
  | 'bakery'
  | 'gym'
  | 'yoga'
  | 'other';

export interface Business {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  sourceUrl: string | null;
  logo: string | null;
  heroImage: string | null;
  galleryImages: string | null;
  primaryColor: string;
  secondaryColor: string;
  businessType: string;
  services: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  calendlyUrl: string | null;
  socialLinks: string | null;
  openingHours: string | null;
  leadFormFields: string | null;
  calendarTokens: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Site {
  id: string;
  businessId: string;
  slug: string;
  headline: string;
  subheadline: string | null;
  aboutText: string | null;
  ctaText: string;
  features: string | null;
  testimonials: string | null;
  isPublished: boolean;
  heroVariant: string;
  viewsA: number;
  viewsB: number;
  conversionsA: number;
  conversionsB: number;
  metaDescription: string | null;
  tagline: string | null;
  valuePropositions: string | null;
  serviceDescriptions: string | null;
  socialMediaBio: string | null;
  templateData: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBusinessInput {
  name: string;
  description: string;
  /** Pre-generated AI story about text (chatbot flow). When provided, skips re-generation. */
  aboutText?: string;
  /** AI-generated per-service descriptions (chatbot flow). */
  serviceDescriptions?: { name: string; description: string }[];
  logo: string | null;
  heroImage: string | null;
  galleryImages?: string[];
  primaryColor: string;
  secondaryColor: string;
  businessType: string;
  services: string[];
  features: string[];
  products: ProductData[];
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  calendlyUrl: string | null;
  socialLinks: SocialLinks | null;
  testimonials: Testimonial[] | null;
  sourceUrl: string;
  leadFormFields?: LeadFormField[];
}

export interface BusinessWithSite extends Business {
  site: (Site & {
    _count: {
      leads: number;
    };
  }) | null;
}
