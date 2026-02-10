// Advanced Web Scraper for Business Data Extraction
// Supports Shopify, WooCommerce, Squarespace, Wix, and general websites

import { scrapeSocialMedia } from './social-scraper';

export interface ProductData {
  name: string;
  description?: string;
  price?: number;
  salePrice?: number;
  image?: string;
  category?: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface ScrapedData {
  // Basic Info
  title: string;
  description: string;
  logo: string | null;
  heroImage: string | null;
  
  // Colors
  primaryColor: string;
  secondaryColor: string;
  
  // Business Classification
  businessType: 'ecommerce' | 'restaurant' | 'service' | 'portfolio' | 'agency' | 'healthcare' | 'fitness' | 'beauty' | 'realestate' | 'education' | 'other';
  
  // Contact
  phone: string | null;
  email: string | null;
  address: string | null;
  
  // Social
  socialLinks: SocialLinks;
  
  // Products/Services
  products: ProductData[];
  services: string[];
  
  // Additional
  openingHours: Record<string, string> | null;
  features: string[];
  testimonials: { name: string; text: string; rating?: number }[];
  
  // Images
  galleryImages: string[];
}

export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  try {
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Handle Instagram URLs specially
    if (normalizedUrl.includes("instagram.com") || normalizedUrl.includes("instagr.am")) {
      return scrapeSocialMedia(normalizedUrl);
    }

    // Handle Facebook URLs specially
    if (normalizedUrl.includes("facebook.com") || normalizedUrl.includes("fb.com")) {
      return scrapeSocialMedia(normalizedUrl);
    }

    // Handle TikTok URLs
    if (normalizedUrl.includes("tiktok.com")) {
      return scrapeSocialMedia(normalizedUrl);
    }

    // Handle Twitter/X URLs
    if (normalizedUrl.includes("twitter.com") || normalizedUrl.includes("x.com")) {
      return scrapeSocialMedia(normalizedUrl);
    }

    // Handle LinkedIn URLs
    if (normalizedUrl.includes("linkedin.com")) {
      return scrapeSocialMedia(normalizedUrl);
    }

    const baseUrl = new URL(normalizedUrl).origin;
    
    // Fetch the main page
    const mainHtml = await fetchPage(normalizedUrl);
    if (!mainHtml) {
      return getDefaultScrapedData();
    }
    
    // Parse main page
    const data = parseWebsite(mainHtml, baseUrl, normalizedUrl);
    
    // If no products found on main page and it's likely e-commerce, try common product pages
    if (data.products.length === 0 && (data.businessType === 'ecommerce' || isLikelyEcommerce(mainHtml))) {
      data.businessType = 'ecommerce';
      const productPageUrls = [
        `${baseUrl}/products`,
        `${baseUrl}/shop`,
        `${baseUrl}/collections`,
        `${baseUrl}/collections/all`,
        `${baseUrl}/store`,
        `${baseUrl}/catalog`,
        `${baseUrl}/all-products`,
      ];
      
      for (const productUrl of productPageUrls) {
        if (data.products.length >= 8) break;
        try {
          const productHtml = await fetchPage(productUrl);
          if (productHtml) {
            const products = extractProducts(productHtml, baseUrl);
            for (const p of products) {
              if (!data.products.find(existing => existing.name === p.name)) {
                data.products.push(p);
              }
            }
          }
        } catch {
          // Continue trying other URLs
        }
      }
    }
    
    // If still no products found, try scraping from JSON-LD or structured data
    if (data.products.length === 0) {
      const jsonLdProducts = extractJsonLdProducts(mainHtml, baseUrl);
      data.products.push(...jsonLdProducts);
    }
    
    return data;
  } catch (error) {
    console.error("Error scraping website:", error);
    return getDefaultScrapedData();
  }
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch {
    return null;
  }
}

function isLikelyEcommerce(html: string): boolean {
  const lowerHtml = html.toLowerCase();
  const indicators = [
    'add to cart', 'buy now', 'add to bag', 'shop now',
    'product', 'price', 'checkout', 'cart', 'shopify',
    'woocommerce', 'bigcommerce', 'magento'
  ];
  const count = indicators.filter(i => lowerHtml.includes(i)).length;
  return count >= 2;
}

function parseWebsite(html: string, baseUrl: string, fullUrl: string): ScrapedData {
  const data: ScrapedData = {
    title: extractTitle(html),
    description: extractDescription(html),
    logo: extractLogo(html, baseUrl),
    heroImage: extractHeroImage(html, baseUrl),
    primaryColor: extractPrimaryColor(html),
    secondaryColor: "#8b5cf6",
    businessType: detectBusinessType(html, fullUrl),
    phone: extractPhone(html),
    email: extractEmail(html),
    address: extractAddress(html),
    socialLinks: extractSocialLinks(html),
    products: extractProducts(html, baseUrl),
    services: extractServices(html),
    openingHours: extractOpeningHours(html),
    features: extractFeatures(html),
    testimonials: extractTestimonials(html),
    galleryImages: extractGalleryImages(html, baseUrl),
  };

  // Adjust secondary color based on primary
  data.secondaryColor = adjustColor(data.primaryColor);

  return data;
}

// ==================== EXTRACTION FUNCTIONS ====================

function extractTitle(html: string): string {
  const patterns = [
    /<title[^>]*>([^<]+)<\/title>/i,
    /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
    /<meta[^>]*property="og:site_name"[^>]*content="([^"]+)"/i,
    /<h1[^>]*>([^<]+)<\/h1>/i,
    /<meta[^>]*name="application-name"[^>]*content="([^"]+)"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const title = decodeHTMLEntities(match[1]).trim();
      // Clean up common suffixes
      return title
        .replace(/\s*[-|–—]\s*(Home|Official|Website|Shop|Store|Online).*$/i, "")
        .replace(/\s*\|\s*.*$/, "")
        .replace(/\s+-\s+.*$/, "")
        .trim() || "My Business";
    }
  }
  return "My Business";
}

function extractDescription(html: string): string {
  const patterns = [
    /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
    /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i,
    /<meta[^>]*name="twitter:description"[^>]*content="([^"]+)"/i,
    /<p[^>]*class="[^"]*(?:hero|intro|tagline|subtitle|description)[^"]*"[^>]*>([^<]+)<\/p>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1].length > 20) {
      return decodeHTMLEntities(match[1]).trim();
    }
  }
  return "";
}

function extractLogo(html: string, baseUrl: string): string | null {
  const patterns = [
    /<link[^>]*rel="apple-touch-icon"[^>]*href="([^"]+)"/i,
    /<link[^>]*rel="apple-touch-icon-precomposed"[^>]*href="([^"]+)"/i,
    /<link[^>]*rel="icon"[^>]*type="image\/png"[^>]*href="([^"]+)"/i,
    /<link[^>]*rel="icon"[^>]*href="([^"]+)"/i,
    /<img[^>]*class="[^"]*logo[^"]*"[^>]*src="([^"]+)"/i,
    /<img[^>]*alt="[^"]*logo[^"]*"[^>]*src="([^"]+)"/i,
    /<img[^>]*id="[^"]*logo[^"]*"[^>]*src="([^"]+)"/i,
    /<img[^>]*src="([^"]+)"[^>]*class="[^"]*logo[^"]*"/i,
    /<img[^>]*src="([^"]+)"[^>]*alt="[^"]*logo[^"]*"/i,
    // Shopify pattern
    /src="([^"]+)"[^>]*class="[^"]*header__heading-logo[^"]*"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return resolveUrl(match[1], baseUrl);
    }
  }
  return null;
}

function extractHeroImage(html: string, baseUrl: string): string | null {
  const patterns = [
    /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i,
    /<meta[^>]*property="og:image:secure_url"[^>]*content="([^"]+)"/i,
    /<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i,
    /<img[^>]*class="[^"]*(?:hero|banner|featured|main|cover)[^"]*"[^>]*src="([^"]+)"/i,
    /<section[^>]*class="[^"]*hero[^"]*"[^>]*style="[^"]*background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/i,
    /<div[^>]*class="[^"]*(?:hero|banner)[^"]*"[^>]*>[^]*?<img[^>]*src="([^"]+)"/i,
    // Shopify slideshow/hero patterns
    /class="[^"]*(?:slideshow|hero|banner)[^"]*"[^>]*>[^]*?srcset="([^\s"]+)/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const url = resolveUrl(match[1], baseUrl);
      // Skip small icons
      if (!url.includes('favicon') && !url.includes('icon') && !url.includes('logo')) {
        return url;
      }
    }
  }
  return null;
}

function extractPrimaryColor(html: string): string {
  // Try theme-color meta tag
  const themeMatch = html.match(/<meta[^>]*name="theme-color"[^>]*content="([^"]+)"/i);
  if (themeMatch && isValidColor(themeMatch[1])) {
    return themeMatch[1];
  }

  // Try msapplication-TileColor
  const tileMatch = html.match(/<meta[^>]*name="msapplication-TileColor"[^>]*content="([^"]+)"/i);
  if (tileMatch && isValidColor(tileMatch[1])) {
    return tileMatch[1];
  }

  // Try to find CSS variables or common color patterns
  const colorPatterns = [
    /--primary[^:]*:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/i,
    /--brand[^:]*:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/i,
    /--main[^:]*:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/i,
    /--accent[^:]*:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/i,
    /--color-primary[^:]*:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/i,
  ];

  for (const pattern of colorPatterns) {
    const match = html.match(pattern);
    if (match && isValidColor(match[1])) {
      return match[1];
    }
  }

  return "#6366f1";
}

function detectBusinessType(html: string, url: string): ScrapedData['businessType'] {
  const lowerHtml = html.toLowerCase();
  const lowerUrl = url.toLowerCase();

  // E-commerce indicators (most specific first)
  const ecommerceKeywords = ['add to cart', 'buy now', 'shop now', 'add to bag', 'checkout', 'shopping cart', 'shop', 'store', 'product-price', 'price--sale', 'shopify', 'woocommerce', 'bigcommerce'];
  const ecommerceCount = ecommerceKeywords.filter(k => lowerHtml.includes(k)).length;
  if (ecommerceCount >= 2 || lowerUrl.includes('shop') || lowerUrl.includes('store') || lowerHtml.includes('shopify.com')) {
    return 'ecommerce';
  }

  // Restaurant indicators
  const restaurantKeywords = ['menu', 'reservation', 'order online', 'delivery', 'takeout', 'dine-in', 'appetizer', 'entree', 'dessert', 'cuisine', 'restaurant', 'cafe', 'bistro', 'food', 'doordash', 'ubereats', 'grubhub'];
  if (restaurantKeywords.filter(k => lowerHtml.includes(k)).length >= 3) {
    return 'restaurant';
  }

  // Healthcare
  const healthcareKeywords = ['doctor', 'clinic', 'medical', 'health', 'patient', 'appointment', 'healthcare', 'treatment', 'therapy', 'diagnosis', 'physician', 'dentist'];
  if (healthcareKeywords.filter(k => lowerHtml.includes(k)).length >= 3) {
    return 'healthcare';
  }

  // Fitness
  const fitnessKeywords = ['gym', 'fitness', 'workout', 'training', 'exercise', 'membership', 'classes', 'personal trainer', 'crossfit', 'yoga', 'pilates'];
  if (fitnessKeywords.filter(k => lowerHtml.includes(k)).length >= 2) {
    return 'fitness';
  }

  // Beauty/Salon
  const beautyKeywords = ['salon', 'spa', 'beauty', 'hair', 'nail', 'massage', 'facial', 'skincare', 'makeup', 'booking', 'stylist'];
  if (beautyKeywords.filter(k => lowerHtml.includes(k)).length >= 2) {
    return 'beauty';
  }

  // Real Estate
  const realestateKeywords = ['property', 'real estate', 'listing', 'homes for sale', 'rent', 'apartment', 'mortgage', 'realtor', 'mls', 'bedroom', 'sqft'];
  if (realestateKeywords.filter(k => lowerHtml.includes(k)).length >= 2) {
    return 'realestate';
  }

  // Agency/Creative
  const agencyKeywords = ['agency', 'studio', 'creative', 'digital', 'marketing', 'branding', 'design', 'portfolio', 'clients', 'case study'];
  if (agencyKeywords.filter(k => lowerHtml.includes(k)).length >= 3) {
    return 'agency';
  }

  // Portfolio
  const portfolioKeywords = ['portfolio', 'my work', 'projects', 'case study', 'freelance', 'designer', 'developer'];
  if (portfolioKeywords.filter(k => lowerHtml.includes(k)).length >= 2) {
    return 'portfolio';
  }

  // Education
  const educationKeywords = ['course', 'learn', 'education', 'training', 'certificate', 'enroll', 'class', 'lesson', 'tutorial', 'student'];
  if (educationKeywords.filter(k => lowerHtml.includes(k)).length >= 2) {
    return 'education';
  }

  return 'service';
}

function extractPhone(html: string): string | null {
  const patterns = [
    /href="tel:([^"]+)"/i,
    /<a[^>]*>.*?([\+]?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}).*?<\/a>/i,
    /(?:tel|phone|call|contact)[:\s]*([+]?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/i,
    /((?:\+1|1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      const phone = match[1].replace(/[^\d+]/g, '');
      if (phone.length >= 10) {
        return formatPhone(phone);
      }
    }
  }
  return null;
}

function extractEmail(html: string): string | null {
  const pattern = /href="mailto:([^"?]+)/i;
  const match = html.match(pattern);
  if (match) {
    return match[1];
  }

  // Try to find email in text
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const textMatch = html.match(emailPattern);
  if (textMatch && !textMatch[0].includes('example') && !textMatch[0].includes('email.com')) {
    return textMatch[0];
  }

  return null;
}

function extractAddress(html: string): string | null {
  // Look for structured address data
  const schemaMatch = html.match(/"streetAddress"\s*:\s*"([^"]+)"/i);
  if (schemaMatch) {
    return decodeHTMLEntities(schemaMatch[1]);
  }

  // Look for address in common HTML patterns
  const addressPatterns = [
    /<address[^>]*>([^<]+(?:<[^/][^>]*>[^<]*<\/[^>]+>)*[^<]*)<\/address>/i,
    /class="[^"]*address[^"]*"[^>]*>([^<]+)/i,
    /itemprop="address"[^>]*>([^<]+)/i,
  ];

  for (const pattern of addressPatterns) {
    const match = html.match(pattern);
    if (match) {
      const text = match[1].replace(/<[^>]+>/g, ' ').trim();
      if (text.length > 10 && text.length < 200) {
        return text;
      }
    }
  }

  return null;
}

function extractSocialLinks(html: string): SocialLinks {
  const links: SocialLinks = {};

  const socialPatterns = [
    { platform: 'instagram' as const, pattern: /href="(https?:\/\/(?:www\.)?instagram\.com\/[^"]+)"/gi },
    { platform: 'facebook' as const, pattern: /href="(https?:\/\/(?:www\.)?facebook\.com\/[^"]+)"/gi },
    { platform: 'twitter' as const, pattern: /href="(https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^"]+)"/gi },
    { platform: 'linkedin' as const, pattern: /href="(https?:\/\/(?:www\.)?linkedin\.com\/[^"]+)"/gi },
    { platform: 'youtube' as const, pattern: /href="(https?:\/\/(?:www\.)?youtube\.com\/[^"]+)"/gi },
    { platform: 'tiktok' as const, pattern: /href="(https?:\/\/(?:www\.)?tiktok\.com\/[^"]+)"/gi },
  ];

  for (const { platform, pattern } of socialPatterns) {
    const match = html.match(pattern);
    if (match) {
      links[platform] = match[0].match(/href="([^"]+)"/)?.[1];
    }
  }

  return links;
}

function extractProducts(html: string, baseUrl: string): ProductData[] {
  const products: ProductData[] = [];

  // Try JSON-LD structured data first
  const jsonLdProducts = extractJsonLdProducts(html, baseUrl);
  products.push(...jsonLdProducts);

  // If JSON-LD didn't find enough, try HTML patterns
  if (products.length < 8) {
    const htmlProducts = extractHtmlProducts(html, baseUrl);
    for (const p of htmlProducts) {
      if (products.length >= 12) break;
      if (!products.find(existing => existing.name === p.name)) {
        products.push(p);
      }
    }
  }

  return products;
}

function extractJsonLdProducts(html: string, baseUrl: string): ProductData[] {
  const products: ProductData[] = [];
  
  const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  
  while ((match = jsonLdPattern.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      
      // Handle single product
      if (data['@type'] === 'Product') {
        products.push(parseJsonLdProduct(data, baseUrl));
      }
      
      // Handle ItemList (collection of products)
      if (data['@type'] === 'ItemList' && Array.isArray(data.itemListElement)) {
        for (const item of data.itemListElement) {
          if (products.length >= 12) break;
          if (item['@type'] === 'Product' || item.item?.['@type'] === 'Product') {
            const productData = item['@type'] === 'Product' ? item : item.item;
            products.push(parseJsonLdProduct(productData, baseUrl));
          }
        }
      }
      
      // Handle @graph array
      if (Array.isArray(data['@graph'])) {
        for (const item of data['@graph']) {
          if (products.length >= 12) break;
          if (item['@type'] === 'Product') {
            products.push(parseJsonLdProduct(item, baseUrl));
          }
        }
      }
      
      // Handle array of products
      if (Array.isArray(data)) {
        for (const item of data) {
          if (products.length >= 12) break;
          if (item['@type'] === 'Product') {
            products.push(parseJsonLdProduct(item, baseUrl));
          }
        }
      }
    } catch {
      // Continue to next JSON-LD block
    }
  }
  
  return products;
}

function parseJsonLdProduct(data: Record<string, unknown>, baseUrl: string): ProductData {
  const offers = data.offers as Record<string, unknown> | undefined;
  let price: number | undefined;
  let salePrice: number | undefined;
  
  if (offers) {
    if (typeof offers.price === 'number') {
      price = offers.price;
    } else if (typeof offers.price === 'string') {
      price = parseFloat(offers.price);
    }
    if (offers.lowPrice !== undefined) {
      price = parseFloat(String(offers.lowPrice));
    }
  }
  
  // Get image
  let image: string | undefined;
  if (typeof data.image === 'string') {
    image = resolveUrl(data.image, baseUrl);
  } else if (Array.isArray(data.image) && data.image.length > 0) {
    image = resolveUrl(String(data.image[0]), baseUrl);
  } else if (data.image && typeof data.image === 'object' && 'url' in data.image) {
    image = resolveUrl(String(data.image.url), baseUrl);
  }
  
  return {
    name: String(data.name || 'Product'),
    description: data.description ? String(data.description).slice(0, 200) : undefined,
    price,
    salePrice,
    image,
    category: data.category ? String(data.category) : undefined,
  };
}

function extractHtmlProducts(html: string, baseUrl: string): ProductData[] {
  const products: ProductData[] = [];

  // Shopify product card patterns
  const shopifyPatterns = [
    // Shopify card product
    /<div[^>]*class="[^"]*card--product[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[\s\S]*?class="[^"]*card__heading[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>[\s\S]*?(?:<span[^>]*class="[^"]*price[^"]*"[^>]*>[^\d]*(\d+[.,]?\d*))?/gi,
    // Shopify collection product
    /<li[^>]*class="[^"]*collection-product[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[\s\S]*?<a[^>]*class="[^"]*product-title[^"]*"[^>]*>([^<]+)<\/a>[\s\S]*?(?:<span[^>]*class="[^"]*price[^"]*"[^>]*>[^\d]*(\d+[.,]?\d*))?/gi,
  ];

  // WooCommerce patterns
  const wooPatterns = [
    /<li[^>]*class="[^"]*product[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[\s\S]*?<h[23][^>]*class="[^"]*woocommerce-loop-product__title[^"]*"[^>]*>([^<]+)<[\s\S]*?(?:<span[^>]*class="[^"]*price[^"]*"[^>]*>[\s\S]*?<bdi>[^\d]*(\d+[.,]?\d*))?/gi,
  ];

  // Generic product patterns
  const genericPatterns = [
    // Product card with image, title, price
    /<(?:article|div|li)[^>]*class="[^"]*product[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[\s\S]*?<(?:h[2-4]|a|span)[^>]*(?:class="[^"]*(?:title|name|heading)[^"]*")?[^>]*>([^<]{3,80})<[\s\S]*?(?:[\$€£]|price)[^>]*>?[^\d]*(\d+[.,]?\d*)/gi,
    // Alternative pattern
    /<div[^>]*class="[^"]*(?:product|item)[^-]card[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[\s\S]*?>([^<]{3,80})<[\s\S]*?(?:[\$€£])[^\d]*(\d+[.,]?\d*)/gi,
  ];

  const allPatterns = [...shopifyPatterns, ...wooPatterns, ...genericPatterns];

  for (const pattern of allPatterns) {
    pattern.lastIndex = 0; // Reset regex state
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (products.length >= 12) break;

      const [, img, name, priceStr] = match;
      const cleanName = decodeHTMLEntities(name).trim();
      
      if (cleanName.length >= 3 && cleanName.length <= 100) {
        const product: ProductData = {
          name: cleanName,
          image: img ? resolveUrl(img, baseUrl) : undefined,
          price: priceStr ? parseFloat(priceStr.replace(',', '')) : undefined,
        };

        if (!products.find(p => p.name === product.name)) {
          products.push(product);
        }
      }
    }
  }

  // Fallback: extract product images with descriptive alt text
  if (products.length < 4) {
    const imgPattern = /<img[^>]*alt="([^"]{5,80})"[^>]*src="([^"]+)"[^>]*>/gi;
    let imgMatch;
    
    while ((imgMatch = imgPattern.exec(html)) !== null) {
      if (products.length >= 12) break;

      const [, alt, src] = imgMatch;
      
      // Filter out non-product images
      if (src.includes('icon') || src.includes('logo') || src.includes('avatar') ||
          src.includes('banner') || src.includes('.svg') || 
          alt.toLowerCase().includes('logo') || alt.toLowerCase().includes('icon')) {
        continue;
      }

      const cleanAlt = decodeHTMLEntities(alt).trim();
      
      // Check if it looks like a product name
      if (cleanAlt.split(' ').length >= 2 && cleanAlt.split(' ').length <= 8) {
        if (!products.find(p => p.name === cleanAlt)) {
          products.push({
            name: cleanAlt,
            image: resolveUrl(src, baseUrl),
          });
        }
      }
    }
  }

  return products;
}

function extractServices(html: string): string[] {
  const services: string[] = [];

  // Look for service sections
  const servicePatterns = [
    /<(?:li|h[2-4]|div)[^>]*class="[^"]*(?:service|offering)[^"]*"[^>]*>[\s]*(?:<[^>]+>)*([^<]+)/gi,
    /<section[^>]*id="[^"]*service[^"]*"[^>]*>[\s\S]*?<(?:h[2-4]|li)[^>]*>([^<]+)/gi,
    /<div[^>]*class="[^"]*service-item[^"]*"[^>]*>[\s\S]*?<(?:h[2-4])[^>]*>([^<]+)/gi,
  ];

  for (const pattern of servicePatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (services.length >= 8) break;
      const service = decodeHTMLEntities(match[1]).trim();
      if (service.length > 3 && service.length < 100 && !services.includes(service)) {
        services.push(service);
      }
    }
  }

  // Try extracting from lists in service/about sections
  if (services.length === 0) {
    const sectionPattern = /<section[^>]*(?:id|class)="[^"]*(?:service|about|what-we-do)[^"]*"[^>]*>([\s\S]*?)<\/section>/gi;
    let sectionMatch;
    
    while ((sectionMatch = sectionPattern.exec(html)) !== null) {
      const sectionHtml = sectionMatch[1];
      const listItemPattern = /<li[^>]*>([^<]{5,80})/gi;
      let itemMatch;
      
      while ((itemMatch = listItemPattern.exec(sectionHtml)) !== null) {
        if (services.length >= 8) break;
        const text = decodeHTMLEntities(itemMatch[1]).trim();
        if (text.length > 5 && !services.includes(text)) {
          services.push(text);
        }
      }
    }
  }

  return services;
}

function extractOpeningHours(html: string): Record<string, string> | null {
  // Try JSON-LD
  const jsonLdMatch = html.match(/"openingHours"\s*:\s*(\[[^\]]+\]|"[^"]+")/);
  if (jsonLdMatch) {
    try {
      const hours = JSON.parse(jsonLdMatch[1]);
      if (Array.isArray(hours)) {
        const result: Record<string, string> = {};
        for (const h of hours) {
          const parts = String(h).match(/(\w{2}(?:-\w{2})?)\s+(\d{2}:\d{2})-(\d{2}:\d{2})/);
          if (parts) {
            result[parts[1]] = `${parts[2]} - ${parts[3]}`;
          }
        }
        if (Object.keys(result).length > 0) {
          return result;
        }
      }
    } catch { /* ignore */ }
  }

  return null;
}

function extractFeatures(html: string): string[] {
  const features: string[] = [];

  // Look for feature/benefit sections
  const featurePatterns = [
    /<div[^>]*class="[^"]*(?:feature|benefit|highlight|usp)[^"]*"[^>]*>[\s\S]*?<(?:h[2-4]|p|span)[^>]*>([^<]{5,80})/gi,
    /<li[^>]*class="[^"]*(?:feature|benefit)[^"]*"[^>]*>([^<]{5,80})/gi,
    // Icon with text pattern
    /<div[^>]*class="[^"]*(?:icon|feature)[^"]*"[^>]*>[\s\S]*?<(?:p|span|h[3-5])[^>]*>([^<]{5,60})/gi,
  ];

  for (const pattern of featurePatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (features.length >= 6) break;
      const feature = decodeHTMLEntities(match[1]).trim();
      if (feature.length > 5 && feature.length < 100 && !features.includes(feature)) {
        features.push(feature);
      }
    }
  }

  return features;
}

function extractTestimonials(html: string): { name: string; text: string; rating?: number }[] {
  const testimonials: { name: string; text: string; rating?: number }[] = [];

  // Look for testimonial/review sections
  const testimonialPatterns = [
    /<(?:div|blockquote)[^>]*class="[^"]*(?:testimonial|review|quote)[^"]*"[^>]*>[\s\S]*?(?:<p[^>]*>|")([^<"]{20,400})(?:<\/p>|")[\s\S]*?(?:<(?:cite|span|p)[^>]*class="[^"]*(?:author|name|customer)[^"]*"[^>]*>([^<]+)|<strong>([^<]+))/gi,
    // Review with star rating
    /<div[^>]*class="[^"]*review[^"]*"[^>]*>[\s\S]*?<p[^>]*>([^<]{20,400})<\/p>[\s\S]*?<(?:span|p)[^>]*class="[^"]*(?:name|author)[^"]*"[^>]*>([^<]+)/gi,
  ];

  for (const pattern of testimonialPatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (testimonials.length >= 4) break;
      
      const text = decodeHTMLEntities(match[1]).trim();
      const name = decodeHTMLEntities(match[2] || match[3] || 'Customer').trim();
      
      if (text.length >= 20 && text.length <= 500 && !testimonials.find(t => t.text === text)) {
        testimonials.push({ name, text });
      }
    }
  }

  return testimonials;
}

function extractGalleryImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  // Extract high-quality images
  const imgPattern = /<img[^>]*src="([^"]+)"[^>]*>/gi;
  let match;

  while ((match = imgPattern.exec(html)) !== null) {
    if (images.length >= 10) break;

    const src = match[1];
    
    // Skip small icons, logos, tracking pixels
    if (src.includes('icon') || src.includes('logo') || src.includes('pixel') ||
        src.includes('tracking') || src.includes('1x1') || src.includes('spacer') ||
        src.includes('.svg') || src.endsWith('.gif') || src.includes('avatar') ||
        src.includes('badge') || src.includes('payment')) {
      continue;
    }

    const resolved = resolveUrl(src, baseUrl);
    if (!seen.has(resolved)) {
      seen.add(resolved);
      images.push(resolved);
    }
  }

  return images;
}

// ==================== HELPER FUNCTIONS ====================

function resolveUrl(url: string, baseUrl: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function isValidColor(color: string): boolean {
  return /^#[0-9a-fA-F]{3,6}$/.test(color);
}

function adjustColor(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const newR = Math.min(255, Math.max(0, r + 30));
    const newG = Math.min(255, Math.max(0, g - 20));
    const newB = Math.min(255, Math.max(0, b + 40));

    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  } catch {
    return "#8b5cf6";
  }
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

function getDefaultScrapedData(): ScrapedData {
  return {
    title: "My Business",
    description: "Professional services and products for your needs",
    logo: null,
    heroImage: null,
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
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
  };
}

// Slug generation
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
}

export function generateUniqueSlug(name: string): string {
  const baseSlug = generateSlug(name);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomSuffix}`;
}
