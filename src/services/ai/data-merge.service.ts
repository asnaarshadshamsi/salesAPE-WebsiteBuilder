/**
 * Data Merge and Resolution Service
 * Intelligently combines data from multiple sources (scraping, LLM, etc.)
 * Resolves conflicts and fills missing fields
 */

import { ScrapedDataExtended, LLMExtractedData } from '@/types/landing-page';
import { BusinessType, SocialLinks, Testimonial } from '@/types';

interface MergedData {
  name: string;
  description: string;
  logo: string | null;
  heroImage: string | null;
  galleryImages: string[];
  primaryColor: string;
  secondaryColor: string;
  businessType: BusinessType;
  industry?: string;
  category?: string;
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
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  socialLinks: SocialLinks;
  calendlyUrl?: string;
  openingHours?: Record<string, string>;
  aboutContent?: string;
  testimonials: Testimonial[];
  targetAudience?: string;
  tone?: string;
  uniqueSellingPoints?: string[];
  keyMessages?: string[];
  callToAction?: string;
  confidence: 'high' | 'medium' | 'low';
  // Enhanced scraper context for LLM
  rawText?: string;
  scrapedImages?: Array<{ url: string; alt: string; type: string }>;
}

export class DataMergeService {
  /**
   * Merge data from scraping and LLM extraction
   * Priority: LLM > Scraped (user intent overrides website data)
   * But prefer scraped data for assets (images, colors, etc.)
   */
  merge(
    scraped: ScrapedDataExtended | null,
    llmData: LLMExtractedData | null
  ): MergedData {
    console.log('[DataMerge] Merging data from sources');

    // Default values
    const defaults = this.getDefaults();

    // Merge step by step
    const merged: MergedData = {
      // Name: prefer LLM if provided, otherwise scraped
      name: llmData?.businessName || scraped?.name || defaults.name,

      // Description: prefer LLM if provided, otherwise scraped
      description: llmData?.description || scraped?.description || defaults.description,

      // Logo: prefer scraped (actual asset)
      logo: scraped?.logo || null,

      // Hero image: prefer scraped (actual asset)
      heroImage: scraped?.heroImage || null,

      // Gallery: from scraped only (user can't provide these via text)
      galleryImages: scraped?.galleryImages || [],

      // Colors: prefer LLM if user specified, otherwise scraped
      primaryColor: llmData?.preferredColors?.primary || scraped?.primaryColor || defaults.primaryColor,
      secondaryColor: llmData?.preferredColors?.secondary || scraped?.secondaryColor || defaults.secondaryColor,

      // Business type: prefer LLM if provided, otherwise scraped
      businessType: llmData?.businessType || scraped?.businessType || 'other',

      // Industry & category: prefer LLM
      industry: llmData?.industry || scraped?.industry,
      category: llmData?.category || scraped?.category,

      // Services: merge both sources, LLM first
      services: this.mergeArrays(llmData?.services, scraped?.services, 8),

      // Features: merge both sources, LLM first
      features: this.mergeArrays(llmData?.features, scraped?.features, 8),

      // Products: from scraped only
      products: scraped?.products || [],

      // Contact info: prefer LLM if provided (user might want to override), fallback to scraped
      phone: llmData?.phone || scraped?.phone || null,
      email: llmData?.email || scraped?.email || null,
      address: llmData?.address || scraped?.address || null,
      city: scraped?.city || null,

      // Social links: merge both, prefer scraped for completeness
      socialLinks: this.mergeSocialLinks(scraped?.socialLinks, llmData?.socialLinks),

      // Opening hours: from scraped only
      openingHours: scraped?.openingHours,

      // About content: prefer scraped
      aboutContent: scraped?.aboutContent,

      // Testimonials: from scraped only
      testimonials: scraped?.testimonials || [],

      // Target audience: from LLM only
      targetAudience: llmData?.targetAudience,

      // Tone: from LLM only
      tone: llmData?.tone,

      // USPs: from LLM only
      uniqueSellingPoints: llmData?.uniqueSellingPoints,

      // Key messages: from LLM only
      keyMessages: llmData?.keyMessages,

      // CTA: from LLM only
      callToAction: llmData?.callToAction,

      // Confidence: calculate based on data quality
      confidence: this.calculateConfidence(scraped, llmData),

      // Enhanced scraper context (pass-through for LLM downstream)
      rawText: (scraped as any)?.rawText || '',
      scrapedImages: (scraped as any)?.scrapedImages || [],
    };

    return merged;
  }

  /**
   * Merge arrays from multiple sources, removing duplicates
   */
  private mergeArrays(arr1?: string[], arr2?: string[], maxItems: number = 10): string[] {
    const combined = [...(arr1 || []), ...(arr2 || [])];
    const unique = Array.from(new Set(combined.map(s => s.trim().toLowerCase())))
      .map(s => {
        // Find original casing
        return combined.find(original => original.trim().toLowerCase() === s) || s;
      });
    
    return unique.slice(0, maxItems);
  }

  /**
   * Merge social links, preferring non-null values
   */
  private mergeSocialLinks(
    scraped?: SocialLinks,
    llm?: Partial<SocialLinks>
  ): SocialLinks {
    return {
      instagram: llm?.instagram || scraped?.instagram,
      facebook: llm?.facebook || scraped?.facebook,
      twitter: llm?.twitter || scraped?.twitter,
      linkedin: llm?.linkedin || scraped?.linkedin,
      youtube: scraped?.youtube,
      tiktok: scraped?.tiktok,
    };
  }

  /**
   * Calculate overall confidence level
   */
  private calculateConfidence(
    scraped: ScrapedDataExtended | null,
    llmData: LLMExtractedData | null
  ): 'high' | 'medium' | 'low' {
    let score = 0;

    // Scraped data quality
    if (scraped) {
      if (scraped.confidence === 'high') score += 3;
      else if (scraped.confidence === 'medium') score += 2;
      else score += 1;

      if (scraped.logo) score += 1;
      if (scraped.heroImage) score += 1;
      if (scraped.services.length >= 3) score += 1;
      if (scraped.testimonials.length >= 2) score += 1;
    }

    // LLM data quality
    if (llmData) {
      if (llmData.businessName) score += 1;
      if (llmData.description) score += 1;
      if (llmData.services && llmData.services.length >= 3) score += 1;
      if (llmData.uniqueSellingPoints && llmData.uniqueSellingPoints.length >= 2) score += 1;
    }

    // Both sources present
    if (scraped && llmData) score += 2;

    if (score >= 10) return 'high';
    if (score >= 6) return 'medium';
    return 'low';
  }

  /**
   * Get default values
   */
  private getDefaults() {
    return {
      name: 'Business Name',
      description: 'We provide excellent services to our customers.',
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
    };
  }

  /**
   * Identify missing fields
   */
  identifyMissingFields(data: MergedData): string[] {
    const missing: string[] = [];

    if (!data.name || data.name === 'Business Name') missing.push('name');
    if (!data.description || data.description.length < 20) missing.push('description');
    if (!data.logo) missing.push('logo');
    if (!data.heroImage) missing.push('heroImage');
    if (data.galleryImages.length === 0) missing.push('galleryImages');
    if (data.services.length === 0) missing.push('services');
    if (data.features.length === 0) missing.push('features');
    if (!data.phone && !data.email) missing.push('contact info');
    if (data.testimonials.length === 0) missing.push('testimonials');
    if (!data.aboutContent || data.aboutContent.length < 50) missing.push('aboutContent');

    return missing;
  }

  /**
   * Identify which fields were generated vs extracted
   */
  identifyGeneratedFields(
    merged: MergedData,
    scraped: ScrapedDataExtended | null,
    llmData: LLMExtractedData | null
  ): string[] {
    const generated: string[] = [];

    // Check if values are defaults
    if (merged.name === 'Business Name') generated.push('name');
    if (merged.description === 'We provide excellent services to our customers.') {
      generated.push('description');
    }
    if (merged.primaryColor === '#3b82f6' && !scraped?.primaryColor && !llmData?.preferredColors?.primary) {
      generated.push('primaryColor');
    }
    if (merged.secondaryColor === '#8b5cf6' && !scraped?.secondaryColor && !llmData?.preferredColors?.secondary) {
      generated.push('secondaryColor');
    }

    return generated;
  }
}

export const dataMergeService = new DataMergeService();
