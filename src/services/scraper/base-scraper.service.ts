import { ScrapedData, SourceType, ConfidenceLevel, BusinessType } from '@/types';

/**
 * User agents for scraping
 */
export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
];

export const MOBILE_USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Instagram 300.0.0.0.0 Android',
];

export function getRandomUserAgent(mobile = false): string {
  const agents = mobile ? MOBILE_USER_AGENTS : USER_AGENTS;
  return agents[Math.floor(Math.random() * agents.length)];
}

/**
 * Detect source type from URL
 */
export function detectSourceType(url: string): SourceType {
  const lower = url.toLowerCase();
  
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'instagram';
  if (lower.includes('facebook.com') || lower.includes('fb.com') || lower.includes('fb.me')) return 'facebook';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  if (lower.includes('linkedin.com')) return 'linkedin';
  if (lower.includes('google.com/maps') || lower.includes('goo.gl/maps') || lower.includes('g.page')) return 'google_business';
  
  return 'website';
}

/**
 * Get default scraped data
 */
export function getDefaultScrapedData(
  sourceType: SourceType,
  confidence: ConfidenceLevel
): ScrapedData {
  return {
    title: 'Unknown Business',
    description: '',
    logo: null,
    heroImage: null,
    primaryColor: '#3B82F6',
    secondaryColor: '#1E3A8A',
    businessType: 'service',
    phone: null,
    email: null,
    address: null,
    socialLinks: {},
    products: [],
    services: [],
    openingHours: null,
    features: [],
    testimonials: [],
    galleryImages: [],
    sourceType,
    scrapedAt: new Date().toISOString(),
    confidence,
  };
}

/**
 * Extract color from string (hex codes)
 */
export function extractColorFromHTML(html: string): string | null {
  const hexMatch = html.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/);
  return hexMatch ? hexMatch[0] : null;
}

/**
 * Validate and normalize URL
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!normalized.startsWith('http')) {
    normalized = `https://${normalized}`;
  }
  return normalized;
}

/**
 * Make HTTP request with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<Response | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': getRandomUserAgent(),
          ...options.headers,
        },
      });
      
      if (response.ok) return response;
      
      // Don't retry on 4xx errors (except 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return null;
      }
    } catch (error) {
      console.error(`Fetch attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) return null;
    }
    
    // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
  }
  
  return null;
}

/**
 * Extract email from text
 */
export function extractEmail(text: string): string | null {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailRegex);
  return match ? match[0] : null;
}

/**
 * Extract phone from text
 */
export function extractPhone(text: string): string | null {
  // Match various phone formats
  const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : null;
}

/**
 * Generate unique slug from name
 */
export function generateUniqueSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Add random suffix to ensure uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${slug}-${randomSuffix}`;
}
