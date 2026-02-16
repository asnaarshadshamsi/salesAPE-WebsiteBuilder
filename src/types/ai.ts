import { BusinessType } from './business';

export interface GeneratedContent {
  headline: string;
  subheadline: string;
  aboutText: string;
  ctaText: string;
  services: string[];
  features: string[];
  metaDescription?: string;
  tagline?: string;
  valuePropositions?: string[];
  serviceDescriptions?: string[];
  socialMediaBio?: string;
}

export interface ContentGenerationInput {
  name: string;
  description: string;
  businessType: BusinessType;
  services: string[];
  features: string[];
}

export interface ExtractedBusinessInfo {
  businessName: string;
  description: string;
  businessType: BusinessType;
  services: string[];
  features: string[];
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  primaryColor: string;
  secondaryColor: string;
  targetAudience: string | null;
  uniqueSellingPoints: string[];
}
