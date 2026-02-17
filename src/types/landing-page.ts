/**
 * Comprehensive Landing Page Data Schema
 * Re-exports BusinessData from the template as the canonical type.
 * Legacy CompleteLandingPageData is kept as an alias.
 */

import { BusinessType, SocialLinks, Testimonial } from './';

// Re-export the canonical template type
export type { BusinessData as BusinessDataTemplate } from '@/components/template/types/landing';
import type { BusinessData } from '@/components/template/types/landing';

// Legacy alias — the pipeline now generates BusinessData directly
export type CompleteLandingPageData = BusinessData;

// ==================== CORE TYPES (kept for pipeline internals) ====================

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface CTAButton {
  label: string;
  href: string;
  icon?: string;
  external?: boolean;
}

export interface Feature {
  title: string;
  description: string;
  icon?: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface PortfolioItem {
  name: string;
  description: string;
  category?: string;
  image: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  placeholder?: string;
  required: boolean;
}

// ==================== INPUT SOURCES ====================

export interface URLInput {
  type: 'url';
  url: string;
}

export interface TextInput {
  type: 'text';
  content: string;
}

export interface VoiceInput {
  type: 'voice';
  transcript: string;
}

export type InputSource = URLInput | TextInput | VoiceInput;

// ==================== EXTRACTION RESULTS ====================

export interface ScrapedDataExtended {
  // Basic Info
  name: string;
  description: string;
  industry?: string;
  category?: string;

  // Brand Assets
  logo: string | null;
  heroImage: string | null;
  galleryImages: string[];
  primaryColor: string;
  secondaryColor: string;

  // Business Details
  businessType: BusinessType;
  services: string[];
  features: string[];
  products: Array<{
    name: string;
    description?: string;
    price?: number;
    salePrice?: number;
    image?: string;
    category?: string;
  }>;

  // Contact Info
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;

  // Social & External
  socialLinks: SocialLinks;
  calendlyUrl?: string;
  openingHours?: Record<string, string>;

  // Content
  aboutContent?: string;
  testimonials: Testimonial[];
  portfolioItems?: Array<{
    title: string;
    description?: string;
    image: string;
    category?: string;
  }>;

  // Metadata
  confidence: 'high' | 'medium' | 'low';
  sourceType: string;
  scrapedAt: string;
}

export interface LLMExtractedData {
  // Core Business Info
  businessName?: string;
  businessType?: BusinessType;
  targetAudience?: string;
  industry?: string;
  category?: string;

  // Content
  description?: string;
  services?: string[];
  features?: string[];
  uniqueSellingPoints?: string[];

  // Tone & Style
  tone?: string; // professional, modern, friendly, luxury, casual, etc.
  preferredColors?: {
    primary?: string;
    secondary?: string;
  };

  // Contact
  phone?: string;
  email?: string;
  address?: string;
  socialLinks?: Partial<SocialLinks>;

  // Additional Context
  keyMessages?: string[];
  callToAction?: string;
}

// ==================== PIPELINE RESULT ====================

export interface PipelineResult {
  // Final merged data
  data: CompleteLandingPageData;

  // Metadata about the generation
  meta: {
    sources: {
      url?: string;
      hasTextInput: boolean;
      hasVoiceInput: boolean;
    };
    confidence: 'high' | 'medium' | 'low';
    missingFields: string[];
    generatedFields: string[];
    timestamp: string;
  };

  // Warnings or issues
  warnings?: string[];
}
