/**
 * Website Composition Integration Service
 * Orchestrates brand analysis, design system generation, and layout composition
 */

import { brandAnalyzerService } from "./brand-analyzer.service";
import { colorExtractorService } from "./color-extractor.service";
import { designSystemGenerator } from "./design-system-generator.service";
import type { ScrapedData } from "@/types/scraper";
import type { DesignSystem } from "./design-system-generator.service";

export interface CompositionConfig {
  scrapedData: ScrapedData;
  businessName: string;
  businessType: string;
  description?: string;
}

export interface WebsiteComposition {
  design: DesignSystem;
  brandTone: string;
  imageUsage: string;
  textDensity: string;
  personalityTraits: string[];
}

/**
 * Generate complete website composition with design system
 */
export async function generateWebsiteComposition(
  config: CompositionConfig
): Promise<WebsiteComposition> {
  const { scrapedData, businessName, businessType, description } = config;

  // Step 1: Analyze brand tone
  const brandAnalysis = await brandAnalyzerService.analyzeBrand({
    businessName,
    businessType,
    description: description || scrapedData.description,
    services: scrapedData.services,
    products: scrapedData.products,
    hasLogo: !!scrapedData.logo,
    imageCount: scrapedData.galleryImages?.length || 0,
  });

  // Step 2: Extract brand colors
  const colorPalette = await colorExtractorService.extractBrandColors(
    scrapedData.logo,
    scrapedData.heroImage,
    scrapedData.primaryColor,
    brandAnalysis.tone
  );

  // Step 3: Generate design system
  const designSystem = designSystemGenerator.generateDesignSystem(
    brandAnalysis,
    colorPalette
  );

  return {
    design: designSystem,
    brandTone: brandAnalysis.tone,
    imageUsage: brandAnalysis.visualStyle.imageUsage,
    textDensity: brandAnalysis.visualStyle.textDensity,
    personalityTraits: brandAnalysis.personality,
  };
}

/**
 * Transform scraped data into complete website
 */
export async function composeWebsite(
  scrapedData: ScrapedData
): Promise<WebsiteComposition> {
  return generateWebsiteComposition({
    scrapedData,
    businessName: scrapedData.title,
    businessType: scrapedData.businessType,
    description: scrapedData.description,
  });
}

export const websiteCompositionService = {
  generateWebsiteComposition,
  composeWebsite,
};
