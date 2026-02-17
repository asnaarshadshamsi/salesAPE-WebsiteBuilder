/**
 * Business Analyzer Service
 * Uses the enhanced multi-page scraper to extract comprehensive business data.
 * Returns enriched data including:
 *  - Typed images (logo, hero, gallery, team, product)
 *  - Multi-page content (about, services, testimonials, pricing, FAQ)
 *  - Contact info, social links
 *  - rawText for LLM context
 */

import { enhancedScraperService, type ScrapedImage } from '../scraper/enhanced-scraper.service';
import { contentGeneratorService } from '../ai';

export class BusinessAnalyzerService {
  /**
   * Analyze a URL and extract comprehensive business data
   */
  async analyzeUrl(url: string) {
    if (!url || url.trim().length === 0) {
      throw new Error('Please enter a URL');
    }

    // Use enhanced multi-page scraper for comprehensive extraction
    const scraped = await enhancedScraperService.scrapeWebsite(url);

    // Generate AI content to fill in any gaps
    const content = await contentGeneratorService.generateContent({
      name: scraped.name,
      description: scraped.description,
      businessType: scraped.businessType,
      services: scraped.services,
      features: scraped.features,
    });

    return {
      name: scraped.name,
      description: scraped.description || content.aboutText,
      logo: scraped.logo,
      heroImage: scraped.heroImage,
      primaryColor: scraped.primaryColor,
      secondaryColor: scraped.secondaryColor,
      businessType: scraped.businessType,
      services: scraped.services.length > 0 ? scraped.services : content.services,
      features: scraped.features.length > 0 ? scraped.features : content.features,
      products: scraped.products,
      phone: scraped.phone,
      email: scraped.email,
      address: scraped.address,
      socialLinks: scraped.socialLinks,
      testimonials: scraped.testimonials,
      galleryImages: scraped.galleryImages,
      sourceUrl: url,
      // Enhanced data for downstream LLM usage
      rawText: scraped.rawText,
      scrapedImages: scraped.scrapedImages,
      aboutContent: scraped.aboutContent,
      confidence: scraped.confidence,
    };
  }
}

export const businessAnalyzerService = new BusinessAnalyzerService();
