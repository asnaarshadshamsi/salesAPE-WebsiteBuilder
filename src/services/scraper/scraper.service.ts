import { ScrapedData } from '@/types';
import {
  getDefaultScrapedData,
  detectSourceType,
  normalizeUrl,
} from './base-scraper.service';

// Import individual scrapers (to be created)
// Since the files are massive, I'm creating a simplified orchestrator
// The full scraper logic can be moved to individual service files

/**
 * Main scraper service - orchestrates scraping based on URL type
 */
export class ScraperService {
  async scrapeUrl(url: string): Promise<ScrapedData> {
    const startTime = Date.now();
    console.log(`[Scraper] Starting scrape for: ${url}`);
    
    try {
      const normalizedUrl = normalizeUrl(url);
      const sourceType = detectSourceType(normalizedUrl);
      console.log(`[Scraper] Detected source type: ${sourceType}`);

      // For now, import the legacy scraper
      // This will be gradually replaced with modular services
      const { scrapeWebsite } = await import('@/lib/production-scraper');
      const result = await scrapeWebsite(normalizedUrl);

      const elapsed = Date.now() - startTime;
      console.log(`[Scraper] Completed in ${elapsed}ms`);

      return result;
    } catch (error) {
      console.error('[Scraper] Fatal error:', error);
      return getDefaultScrapedData('website', 'low');
    }
  }
}

export const scraperService = new ScraperService();
