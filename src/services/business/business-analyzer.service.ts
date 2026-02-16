import { scraperService } from '../scraper';
import { contentGeneratorService } from '../ai';
import { BusinessType } from '@/types';

/**
 * Business analyzer service - analyzes URLs and extracts business data
 */
export class BusinessAnalyzerService {
  /**
   * Analyze a URL and extract business data
   */
  async analyzeUrl(url: string) {
    if (!url || url.trim().length === 0) {
      throw new Error('Please enter a URL');
    }

    // Scrape the website
    const scraped = await scraperService.scrapeUrl(url);
    
    // Generate enhanced content
    const content = await contentGeneratorService.generateContent({
      name: scraped.title,
      description: scraped.description,
      businessType: scraped.businessType,
      services: scraped.services,
      features: scraped.features,
    });

    return {
      name: scraped.title,
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
    };
  }
}

export const businessAnalyzerService = new BusinessAnalyzerService();
