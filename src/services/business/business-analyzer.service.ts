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
import { cohereGenerate } from '@/lib/cohere-ai';
import type { BusinessType } from '@/types';

// All valid business type values the AI may return
const VALID_BUSINESS_TYPES: BusinessType[] = [
  'ecommerce','restaurant','service','portfolio','agency','healthcare','fitness','beauty',
  'realestate','education','startup','perfume','flowershop','cafe','spa','jewelry',
  'photography','barbershop','cleaning','petcare','law','accounting','dental','hotel',
  'events','catering','tech','consulting','bakery','gym','yoga','other',
];

/**
 * Use Cohere AI to determine the true business type from scraped text.
 * Returns null when AI cannot confidently classify (keep scraper result).
 */
// Maps terms the LLM might return that are NOT in VALID_BUSINESS_TYPES to their correct type
const AI_RESPONSE_ALIASES: Record<string, BusinessType> = {
  clothing: 'ecommerce',
  fashion: 'ecommerce',
  retail: 'ecommerce',
  apparel: 'ecommerce',
  luxury: 'ecommerce',
  boutique: 'ecommerce',
  textile: 'ecommerce',
  garment: 'ecommerce',
  couture: 'ecommerce',
  brand: 'ecommerce',
  store: 'ecommerce',
  shop: 'ecommerce',
  jewellery: 'jewelry',
  jeweler: 'jewelry',
  food: 'restaurant',
  diner: 'restaurant',
  eatery: 'restaurant',
  clinic: 'healthcare',
  hospital: 'healthcare',
  doctor: 'healthcare',
  gym: 'fitness',
  salon: 'beauty',
};

// Keywords whose presence (with high density) immediately signals ecommerce fashion/apparel —
// avoids wasting an LLM call and prevents false-positive restaurant classification.
const FASHION_ECOMMERCE_KEYWORDS = [
  'kurta', 'shalwar', 'kameez', 'dupatta', 'lehenga', 'saree', 'lawn collection',
  'pret', 'unstitched', 'semi-stitched', 'bridal collection', 'luxury pret',
  'ready to wear', 'ready-to-wear', 'couture', 'fashion week',
  'clothing brand', 'apparel brand', 'fashion brand', 'fashion house',
  'new collection', 'summer collection', 'winter collection', 'festive collection',
  'add to cart', 'add to bag', 'size guide', 'size chart', 'buy now',
];

export async function aiReclassifyBusinessType(
  rawText: string,
  scraperType: string,
): Promise<BusinessType | null> {
  if (!rawText || rawText.length < 80) return null;

  const textLower = rawText.toLowerCase();

  // ── Fast-path: keyword-based override (no LLM call needed) ────────────────
  // If 2+ strong fashion/apparel signals are found, it's definitely ecommerce.
  const fashionHits = FASHION_ECOMMERCE_KEYWORDS.filter(kw => textLower.includes(kw));
  if (fashionHits.length >= 2) {
    console.log(`[BusinessAnalyzer] Fashion fast-path triggered (${fashionHits.slice(0, 3).join(', ')}) → "ecommerce"`);
    return 'ecommerce';
  }

  const snippet = rawText.slice(0, 2500);
  const types = VALID_BUSINESS_TYPES.join(', ');

  const prompt = `You are a precise business classifier. Based ONLY on the website content below, output the single most accurate business type from this list:\n${types}\n\nRules:\n- Output ONLY one word from the list above. Nothing else.\n- Choose "ecommerce" if the site sells products/clothing/fashion/accessories/fragrance/apparel/luxury brands online.\n- Choose "restaurant" ONLY if the primary offering is physical dine-in meals or food delivery service.\n- Do NOT choose "restaurant" for clothing, fashion, or luxury brand websites.\n- If unsure, default to "service".\n\nWebsite content:\n"""${snippet}"""\n\nBusiness type:`;

  try {
    const result = await cohereGenerate(prompt, { maxTokens: 10, temperature: 0.1 });
    if (!result) return null;
    const candidate = result.trim().toLowerCase().replace(/[^a-z]/g, '');

    // Check exact match first
    if (VALID_BUSINESS_TYPES.includes(candidate as BusinessType)) {
      if (candidate !== scraperType) {
        console.log(`[BusinessAnalyzer] AI reclassified "${scraperType}" → "${candidate}"`);
      }
      return candidate as BusinessType;
    }

    // Check alias map — handles "clothing", "fashion", "retail", etc.
    const aliased = AI_RESPONSE_ALIASES[candidate];
    if (aliased) {
      console.log(`[BusinessAnalyzer] AI returned alias "${candidate}" → mapped to "${aliased}"`);
      return aliased;
    }

    console.warn(`[BusinessAnalyzer] AI returned unknown type "${candidate}", ignoring`);
    return null;
  } catch {
    return null;
  }
}

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

    // ── AI override: re-classify business type using Cohere LLM ──────
    // This catches cases where keyword scoring misclassifies fashion/ecommerce
    // sites as restaurant (e.g. Asimjofa) or other false positives.
    const aiType = await aiReclassifyBusinessType(scraped.rawText, scraped.businessType);
    if (aiType) {
      scraped.businessType = aiType;
    }
    // ─────────────────────────────────────────────────────────────────

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
