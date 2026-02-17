import { ProductData } from './product';
import { SocialLinks, Testimonial } from './social';
import { BusinessType } from './business';

export type { ProductData } from './product';

export type SourceType = 
  | 'website' 
  | 'instagram' 
  | 'facebook' 
  | 'tiktok' 
  | 'twitter' 
  | 'linkedin' 
  | 'google_business';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface PortfolioItem {
  title: string;
  description?: string;
  image: string;
  category?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  image?: string;
  bio?: string;
}

export interface PricingInfo {
  name: string;
  price: string;
  features: string[];
}

export interface ScrapedPage {
  url: string;
  type: string;
  title: string;
  content: string;
  images: string[];
}

export interface ScrapedData {
  title: string;
  description: string;
  logo: string | null;
  heroImage: string | null;
  primaryColor: string;
  secondaryColor: string;
  businessType: BusinessType;
  phone: string | null;
  email: string | null;
  address: string | null;
  socialLinks: SocialLinks;
  products: ProductData[];
  services: string[];
  openingHours: Record<string, string> | null;
  features: string[];
  testimonials: Testimonial[];
  galleryImages: string[];
  sourceType: SourceType;
  scrapedAt: string;
  confidence: ConfidenceLevel;
  portfolioItems?: PortfolioItem[];
  teamMembers?: TeamMember[];
  aboutContent?: string;
  pricingInfo?: PricingInfo[];
  pages?: ScrapedPage[];
}
