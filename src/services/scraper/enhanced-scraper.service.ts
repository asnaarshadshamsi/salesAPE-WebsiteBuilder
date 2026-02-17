/**
 * Enhanced Web Scraper Service
 * Comprehensive data extraction from websites including:
 * - Brand colors extraction
 * - Image and logo detection
 * - Business information extraction
 * - Multi-page crawling for complete data
 */

import { ScrapedDataExtended } from '@/types/landing-page';
import { BusinessType, SocialLinks, Testimonial } from '@/types';

// ==================== COLOR EXTRACTION ====================

interface ExtractedColors {
  primary: string;
  secondary: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Extract brand colors from HTML content and CSS
 */
function extractColors(html: string, cssContent?: string): ExtractedColors {
  const colors: string[] = [];
  
  // Extract from inline styles
  const inlineStyleRegex = /style=["'][^"']*color:\s*([^;"']+)/gi;
  let match;
  while ((match = inlineStyleRegex.exec(html)) !== null) {
    colors.push(match[1].trim());
  }

  // Extract from background colors
  const bgColorRegex = /background(?:-color)?:\s*([^;"']+)/gi;
  while ((match = bgColorRegex.exec(html)) !== null) {
    colors.push(match[1].trim());
  }

  // Extract from CSS if provided
  if (cssContent) {
    const cssColorRegex = /(?:color|background(?:-color)?):\s*([^;]+)/gi;
    while ((match = cssColorRegex.exec(cssContent)) !== null) {
      colors.push(match[1].trim());
    }
  }

  // Extract from meta theme-color
  const themeColorMatch = html.match(/<meta\s+name=["']theme-color["']\s+content=["']([^"']+)["']/i);
  if (themeColorMatch) {
    colors.push(themeColorMatch[1]);
  }

  // Convert all colors to hex and filter valid ones
  const hexColors = colors
    .map(normalizeColor)
    .filter(isValidColor)
    .filter(isNotGrayscale);

  // Count occurrences
  const colorCounts = new Map<string, number>();
  hexColors.forEach(color => {
    colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
  });

  // Sort by frequency
  const sortedColors = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([color]) => color);

  // Pick primary and secondary colors
  const primary = sortedColors[0] || '#3b82f6'; // Default blue
  const secondary = sortedColors.find(c => !areSimilarColors(c, primary)) || '#8b5cf6'; // Default purple

  return {
    primary,
    secondary,
    confidence: sortedColors.length >= 5 ? 'high' : sortedColors.length >= 2 ? 'medium' : 'low',
  };
}

/**
 * Normalize color to hex format
 */
function normalizeColor(color: string): string {
  color = color.trim().toLowerCase();

  // Already hex
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return color;
  }

  // Short hex
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }

  // RGB
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  // RGBA (ignore alpha)
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  // Named colors (common ones)
  const namedColors: Record<string, string> = {
    blue: '#0000ff',
    red: '#ff0000',
    green: '#008000',
    purple: '#800080',
    orange: '#ffa500',
    pink: '#ffc0cb',
    teal: '#008080',
    navy: '#000080',
    gold: '#ffd700',
  };

  return namedColors[color] || '';
}

function isValidColor(hex: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(hex);
}

function isNotGrayscale(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Check if all values are similar (grayscale)
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(b - r));
  return maxDiff > 30; // Not grayscale if difference is significant
}

function areSimilarColors(color1: string, color2: string): boolean {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  // Euclidean distance in RGB space
  const distance = Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );

  return distance < 100; // Similar if distance is small
}

// ==================== IMAGE EXTRACTION ====================

interface ExtractedImages {
  logo: string | null;
  hero: string | null;
  gallery: string[];
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Extract images from HTML with smart detection
 */
function extractImages(html: string, baseUrl: string): ExtractedImages {
  const images: string[] = [];
  
  // Extract all img tags
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    images.push(resolveUrl(match[1], baseUrl));
  }

  // Extract from meta og:image
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogImageMatch) {
    images.unshift(resolveUrl(ogImageMatch[1], baseUrl));
  }

  // Filter out small images, icons, and tracking pixels
  const validImages = images.filter(img => {
    const lower = img.toLowerCase();
    
    // Skip common small icons
    if (lower.includes('icon') || lower.includes('favicon') || lower.includes('logo-mini')) {
      return false;
    }
    
    // Skip tracking pixels
    if (lower.includes('pixel') || lower.includes('track') || lower.includes('analytics')) {
      return false;
    }
    
    // Skip data URLs that are likely small
    if (lower.startsWith('data:') && lower.length < 1000) {
      return false;
    }
    
    return true;
  });

  // Detect logo - typically in header or has "logo" in path
  const logo = detectLogo(html, validImages, baseUrl);

  // Detect hero image - usually the first large image
  const hero = validImages.find(img => 
    !img.includes('logo') && 
    (img.includes('hero') || img.includes('banner') || img.includes('header'))
  ) || validImages[0] || null;

  // Gallery images - remaining images
  const gallery = validImages
    .filter(img => img !== logo && img !== hero)
    .slice(0, 12); // Limit to 12 images

  return {
    logo,
    hero,
    gallery,
    confidence: validImages.length >= 5 ? 'high' : validImages.length >= 2 ? 'medium' : 'low',
  };
}

function detectLogo(html: string, images: string[], baseUrl: string): string | null {
  // Look for logo in common patterns
  const logoPatterns = [
    /<img[^>]+class=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']*logo[^"']+)["']/i,
    /<img[^>]+alt=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i,
  ];

  for (const pattern of logoPatterns) {
    const match = html.match(pattern);
    if (match) {
      return resolveUrl(match[1], baseUrl);
    }
  }

  // Fall back to first image with "logo" in the path
  return images.find(img => img.toLowerCase().includes('logo')) || null;
}

function resolveUrl(url: string, baseUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  try {
    const base = new URL(baseUrl);
    
    if (url.startsWith('//')) {
      return base.protocol + url;
    }
    
    if (url.startsWith('/')) {
      return base.origin + url;
    }
    
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

// ==================== TEXT CONTENT EXTRACTION ====================

interface ExtractedContent {
  title: string;
  description: string;
  services: string[];
  features: string[];
  aboutContent: string;
  testimonials: Testimonial[];
}

/**
 * Extract text content and business information
 */
function extractContent(html: string): ExtractedContent {
  // Remove scripts and styles
  let cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Extract title
  const titleMatch = cleanHtml.match(/<title>([^<]+)<\/title>/i) ||
                      cleanHtml.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
                      cleanHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract description
  const descMatch = cleanHtml.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
                    cleanHtml.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
                    cleanHtml.match(/<p[^>]*>([^<]{50,200})<\/p>/i);
  const description = descMatch ? descMatch[1].trim() : '';

  // Extract services - look for common patterns
  const services = extractServices(cleanHtml);

  // Extract features
  const features = extractFeatures(cleanHtml);

  // Extract about content
  const aboutContent = extractAboutContent(cleanHtml);

  // Extract testimonials
  const testimonials = extractTestimonials(cleanHtml);

  return {
    title,
    description,
    services,
    features,
    aboutContent,
    testimonials,
  };
}

function extractServices(html: string): string[] {
  const services: Set<string> = new Set();

  // Look for sections with "service" in the class or id
  const serviceRegex = /<[^>]+(?:class|id)=["'][^"']*service[^"']*["'][^>]*>([\s\S]{0,500}?)<\/[^>]+>/gi;
  let match;
  
  while ((match = serviceRegex.exec(html)) !== null) {
    const content = match[1];
    
    // Extract list items
    const listItems = content.match(/<li[^>]*>([^<]+)<\/li>/gi);
    if (listItems) {
      listItems.forEach(item => {
        const text = item.replace(/<[^>]+>/g, '').trim();
        if (text.length > 5 && text.length < 100) {
          services.add(text);
        }
      });
    }

    // Extract headings
    const headings = content.match(/<h[3-6][^>]*>([^<]+)<\/h[3-6]>/gi);
    if (headings) {
      headings.forEach(heading => {
        const text = heading.replace(/<[^>]+>/g, '').trim();
        if (text.length > 5 && text.length < 100) {
          services.add(text);
        }
      });
    }
  }

  return Array.from(services).slice(0, 8);
}

function extractFeatures(html: string): string[] {
  const features: Set<string> = new Set();

  // Look for sections with "feature" in the class or id
  const featureRegex = /<[^>]+(?:class|id)=["'][^"']*feature[^"']*["'][^>]*>([\s\S]{0,500}?)<\/[^>]+>/gi;
  let match;
  
  while ((match = featureRegex.exec(html)) !== null) {
    const content = match[1];
    
    // Extract list items
    const listItems = content.match(/<li[^>]*>([^<]+)<\/li>/gi);
    if (listItems) {
      listItems.forEach(item => {
        const text = item.replace(/<[^>]+>/g, '').trim();
        if (text.length > 5 && text.length < 100) {
          features.add(text);
        }
      });
    }
  }

  return Array.from(features).slice(0, 8);
}

function extractAboutContent(html: string): string {
  // Look for about section
  const aboutRegex = /<[^>]+(?:class|id)=["'][^"']*about[^"']*["'][^>]*>([\s\S]{0,1000}?)<\/[^>]+>/i;
  const match = html.match(aboutRegex);
  
  if (match) {
    return match[1].replace(/<[^>]+>/g, '').trim().slice(0, 500);
  }

  return '';
}

function extractTestimonials(html: string): Testimonial[] {
  const testimonials: Testimonial[] = [];

  // Look for testimonial sections
  const testimonialRegex = /<[^>]+(?:class|id)=["'][^"']*testimonial[^"']*["'][^>]*>([\s\S]{0,800}?)<\/[^>]+>/gi;
  let match;
  
  while ((match = testimonialRegex.exec(html)) !== null && testimonials.length < 6) {
    const content = match[1];
    
    // Extract text and name
    const textMatch = content.match(/<p[^>]*>([^<]{20,300})<\/p>/i);
    const nameMatch = content.match(/<[^>]+(?:class|id)=["'][^"']*(?:name|author)[^"']*["'][^>]*>([^<]+)</i);
    
    if (textMatch) {
      testimonials.push({
        name: nameMatch ? nameMatch[1].trim() : 'Customer',
        text: textMatch[1].trim(),
        rating: 5,
      });
    }
  }

  return testimonials;
}

// ==================== CONTACT INFO EXTRACTION ====================

interface ExtractedContact {
  phone: string | null;
  email: string | null;
  address: string | null;
  socialLinks: SocialLinks;
}

/**
 * Extract contact information from HTML
 */
function extractContactInfo(html: string): ExtractedContact {
  // Extract phone
  const phoneRegex = /(?:tel:|phone:?\s*|call:?\s*)?(\+?[\d\s\-()]{10,20})/gi;
  const phoneMatches = html.match(phoneRegex);
  const phone = phoneMatches ? cleanPhone(phoneMatches[0]) : null;

  // Extract email
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const emailMatches = html.match(emailRegex);
  const email = emailMatches ? emailMatches[0] : null;

  // Extract address (look for common patterns)
  const addressRegex = /<[^>]+(?:class|id)=["'][^"']*address[^"']*["'][^>]*>([^<]{20,200})<\/[^>]+>/i;
  const addressMatch = html.match(addressRegex);
  const address = addressMatch ? addressMatch[1].trim() : null;

  // Extract social links
  const socialLinks = extractSocialLinks(html);

  return {
    phone,
    email,
    address,
    socialLinks,
  };
}

function cleanPhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

function extractSocialLinks(html: string): SocialLinks {
  const links: SocialLinks = {};

  // Look for social media URLs
  const socialPatterns = {
    instagram: /https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)/i,
    facebook: /https?:\/\/(?:www\.)?facebook\.com\/([a-zA-Z0-9_.]+)/i,
    twitter: /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/i,
    linkedin: /https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/([a-zA-Z0-9_-]+)/i,
    youtube: /https?:\/\/(?:www\.)?youtube\.com\/(?:c\/|channel\/|user\/)?([a-zA-Z0-9_-]+)/i,
    tiktok: /https?:\/\/(?:www\.)?tiktok\.com\/@([a-zA-Z0-9_.]+)/i,
  };

  for (const [platform, pattern] of Object.entries(socialPatterns)) {
    const match = html.match(pattern);
    if (match) {
      links[platform as keyof SocialLinks] = match[0];
    }
  }

  return links;
}

// ==================== BUSINESS TYPE DETECTION ====================

function detectBusinessType(html: string, title: string, description: string): BusinessType {
  const content = (html + ' ' + title + ' ' + description).toLowerCase();

  const patterns: Array<[BusinessType, RegExp]> = [
    ['ecommerce', /\b(shop|store|buy|cart|checkout|product|ecommerce)\b/],
    ['restaurant', /\b(restaurant|menu|food|cuisine|dining|chef|reservation)\b/],
    ['agency', /\b(agency|creative|design|marketing|branding|digital)\b/],
    ['healthcare', /\b(health|medical|clinic|doctor|hospital|care|patient)\b/],
    ['fitness', /\b(fitness|gym|workout|training|exercise|yoga|personal\s+trainer)\b/],
    ['beauty', /\b(beauty|salon|spa|hair|makeup|skincare|cosmetic)\b/],
    ['realestate', /\b(real\s+estate|property|realtor|homes?\s+for\s+sale|apartment)\b/],
    ['education', /\b(education|school|course|learning|training|academy|tutor)\b/],
    ['portfolio', /\b(portfolio|projects|work|showcase|designer|developer)\b/],
  ];

  for (const [type, pattern] of patterns) {
    if (pattern.test(content)) {
      return type;
    }
  }

  return 'other';
}

// ==================== MAIN SCRAPER ====================

export class EnhancedScraperService {
  /**
   * Scrape a website and extract comprehensive data
   */
  async scrapeWebsite(url: string): Promise<ScrapedDataExtended> {
    console.log(`[EnhancedScraper] Scraping: ${url}`);

    try {
      // Fetch the HTML
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      // Extract all data
      const colors = extractColors(html);
      const images = extractImages(html, url);
      const content = extractContent(html);
      const contact = extractContactInfo(html);
      const businessType = detectBusinessType(html, content.title, content.description);

      return {
        name: content.title || new URL(url).hostname,
        description: content.description || content.aboutContent || '',
        logo: images.logo,
        heroImage: images.hero,
        galleryImages: images.gallery,
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        businessType,
        services: content.services,
        features: content.features,
        products: [],
        phone: contact.phone,
        email: contact.email,
        address: contact.address,
        city: null,
        socialLinks: contact.socialLinks,
        aboutContent: content.aboutContent,
        testimonials: content.testimonials,
        confidence: this.calculateConfidence(colors, images, content, contact),
        sourceType: 'website',
        scrapedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[EnhancedScraper] Error:', error);
      
      // Return minimal data
      return {
        name: new URL(url).hostname,
        description: '',
        logo: null,
        heroImage: null,
        galleryImages: [],
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        businessType: 'other',
        services: [],
        features: [],
        products: [],
        phone: null,
        email: null,
        address: null,
        city: null,
        socialLinks: {},
        testimonials: [],
        confidence: 'low',
        sourceType: 'website',
        scrapedAt: new Date().toISOString(),
      };
    }
  }

  private calculateConfidence(
    colors: ExtractedColors,
    images: ExtractedImages,
    content: ExtractedContent,
    contact: ExtractedContact
  ): 'high' | 'medium' | 'low' {
    let score = 0;

    // Color confidence
    if (colors.confidence === 'high') score += 2;
    else if (colors.confidence === 'medium') score += 1;

    // Images confidence
    if (images.confidence === 'high') score += 2;
    else if (images.confidence === 'medium') score += 1;

    // Content quality
    if (content.title && content.description) score += 2;
    if (content.services.length >= 3) score += 1;
    if (content.testimonials.length >= 2) score += 1;

    // Contact info
    if (contact.email || contact.phone) score += 1;
    if (Object.keys(contact.socialLinks).length >= 2) score += 1;

    if (score >= 7) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }
}

export const enhancedScraperService = new EnhancedScraperService();
