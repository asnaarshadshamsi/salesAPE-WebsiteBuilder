/**
 * Enhanced Web Scraper Service v2
 * Multi-page crawling with comprehensive data extraction:
 * - All text content (headings, paragraphs, CTAs, pricing, testimonials, FAQ)
 * - All images with type classification (logo, hero, product, gallery, team)
 * - Contact info, social links, navigation
 * - Crawls: homepage + about, services, pricing, contact, portfolio, testimonials
 */

import { ScrapedDataExtended } from '@/types/landing-page';
import { BusinessType, SocialLinks, Testimonial } from '@/types';
import { fetchWithRetry, getRandomUserAgent } from './base-scraper.service';

// ==================== TYPES ====================

export interface ScrapedImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  type: 'logo' | 'hero' | 'product' | 'gallery' | 'team' | 'background' | 'icon' | 'other';
}

interface RawPageData {
  url: string;
  pageType: string;
  html: string;
}

interface ExtractedText {
  title: string;
  metaDescription: string;
  headings: { level: number; text: string }[];
  paragraphs: string[];
  navLinks: { label: string; href: string }[];
  ctaButtons: { label: string; href: string }[];
  services: string[];
  features: string[];
  testimonials: Testimonial[];
  pricingText: string[];
  faqItems: { question: string; answer: string }[];
  aboutContent: string;
  footerContent: string;
  footerEmail: string | null;
  footerPhone: string | null;
  footerAddress: string | null;
}

interface ContactInfo {
  phone: string | null;
  email: string | null;
  address: string | null;
  socialLinks: SocialLinks;
}

export type EnhancedScrapedData = ScrapedDataExtended & {
  rawText: string;
  scrapedImages: ScrapedImage[];
};

// ==================== HELPERS ====================

function resolveUrl(url: string, baseUrl: string): string {
  if (!url || url.startsWith('data:') || url.startsWith('javascript:')) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  try {
    if (url.startsWith('//')) return new URL(baseUrl).protocol + url;
    return new URL(url, baseUrl).href;
  } catch {
    return '';
  }
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&#39;/gi, "'").replace(/&quot;/gi, '"').replace(/\s+/g, ' ').trim();
}

function cleanHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
}

// ==================== IMAGE EXTRACTION ====================

function classifyImage(src: string, alt: string, context: string): ScrapedImage['type'] {
  const lower = (src + ' ' + alt + ' ' + context).toLowerCase();
  if (/logo/i.test(lower)) return 'logo';
  if (/hero|banner|header-img|jumbotron|splash|cover/i.test(lower)) return 'hero';
  if (/product|item|shop|merchandise/i.test(lower)) return 'product';
  if (/team|staff|employee|member|founder|ceo|headshot|portrait/i.test(lower)) return 'team';
  if (/bg[-_]|background|pattern|texture/i.test(lower)) return 'background';
  if (/icon|favicon|sprite|arrow|chevron|check|bullet/i.test(lower)) return 'icon';
  if (/gallery|portfolio|project|work|showcase/i.test(lower)) return 'gallery';
  return 'other';
}

function extractAllImages(html: string, baseUrl: string): ScrapedImage[] {
  const images: ScrapedImage[] = [];
  const seen = new Set<string>();
  const cleaned = cleanHtml(html);

  console.log('[extractAllImages] Starting image extraction...');

  // Extract <img> tags
  const imgRegex = /<img\s+([^>]*?)(?:\/?>)/gi;
  let m;
  let imgCount = 0;
  while ((m = imgRegex.exec(cleaned)) !== null) {
    imgCount++;
    const attrs = m[1];
    // Try src, then data-src, then data-lazy-src, then srcset
    const srcMatch =
      attrs.match(/\bsrc=["']([^"']+)["']/i) ||
      attrs.match(/data-src=["']([^"']+)["']/i) ||
      attrs.match(/data-lazy-src=["']([^"']+)["']/i) ||
      attrs.match(/srcset=["']([^"']+?)(?:\s+\d+[wx])?[,\s"']/i);
    
    if (!srcMatch) {
      console.log('[extractAllImages] No src found in img tag:', attrs.slice(0, 100));
      continue;
    }
    
    const url = resolveUrl(srcMatch[1], baseUrl);
    if (!url) {
      console.log('[extractAllImages] Could not resolve URL:', srcMatch[1]);
      continue;
    }
    if (seen.has(url)) continue;
    seen.add(url);

    const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
    const widthMatch = attrs.match(/width=["']?(\d+)/i);
    const heightMatch = attrs.match(/height=["']?(\d+)/i);
    const classMatch = attrs.match(/class=["']([^"']*)["']/i);

    const w = widthMatch ? parseInt(widthMatch[1]) : undefined;
    const h = heightMatch ? parseInt(heightMatch[1]) : undefined;
    
    // Skip tiny images & tracking pixels
    if ((w && w < 20) || (h && h < 20)) {
      console.log('[extractAllImages] Skipping tiny image:', url);
      continue;
    }
    if (url.includes('pixel') || url.includes('track') || url.includes('analytics')) continue;
    if (url.includes('facebook.com/tr') || url.includes('google-analytics') || url.includes('doubleclick')) continue;
    if (url.endsWith('.svg') && (w && w < 40)) continue; // Skip small SVG icons

    const alt = altMatch ? altMatch[1] : '';
    const ctx = classMatch ? classMatch[1] : '';
    const type = classifyImage(url, alt, ctx);
    images.push({ url, alt, width: w, height: h, type });
    console.log('[extractAllImages] Added image:', { url: url.slice(0, 80), type, alt: alt.slice(0, 30) });
  }

  console.log(`[extractAllImages] Found ${imgCount} img tags, extracted ${images.length} valid images`);

  // Extract og:image
  const ogMatch = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                  html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);
  if (ogMatch) {
    const url = resolveUrl(ogMatch[1], baseUrl);
    if (url && !seen.has(url)) {
      seen.add(url);
      images.unshift({ url, alt: 'og:image', type: 'hero' });
    }
  }

  // Extract CSS background-image URLs
  const bgRegex = /background(?:-image)?:\s*url\(["']?([^"')]+)["']?\)/gi;
  while ((m = bgRegex.exec(html)) !== null) {
    const url = resolveUrl(m[1], baseUrl);
    if (url && !seen.has(url) && !url.includes('data:') && !url.endsWith('.svg')) {
      seen.add(url);
      images.push({ url, alt: '', type: 'background' });
    }
  }

  // Detect logo from <header> or <nav> images
  const headerMatch = cleaned.match(/<(?:header|nav)[^>]*>([\s\S]*?)<\/(?:header|nav)>/i);
  if (headerMatch) {
    const headerImgMatch = headerMatch[1].match(/<img[^>]+src=["']([^"']+)["']/i);
    if (headerImgMatch) {
      const headerImgUrl = resolveUrl(headerImgMatch[1], baseUrl);
      const existing = images.find(img => img.url === headerImgUrl);
      if (existing) existing.type = 'logo';
    }
  }

  // Detect hero from first large image in <main> or section.hero
  const heroSection = cleaned.match(/<(?:section|div)[^>]*(?:class|id)=["'][^"']*hero[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div)>/i);
  if (heroSection) {
    const heroImgMatch = heroSection[1].match(/<img[^>]+src=["']([^"']+)["']/i);
    if (heroImgMatch) {
      const heroUrl = resolveUrl(heroImgMatch[1], baseUrl);
      const existing = images.find(img => img.url === heroUrl);
      if (existing) existing.type = 'hero';
    }
  }

  return images;
}

// ==================== TEXT EXTRACTION ====================

function extractText(html: string, baseUrl: string): ExtractedText {
  const clean = cleanHtml(html);

  // Title
  const titleMatch = clean.match(/<title[^>]*>([^<]+)<\/title>/i);
  const ogTitle = clean.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i);
  const h1Match = clean.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = stripTags(titleMatch?.[1] || ogTitle?.[1] || h1Match?.[1] || '');

  // Meta description
  const metaDesc = clean.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const ogDesc = clean.match(/<meta\s+(?:property|name)=["']og:description["']\s+content=["']([^"']+)["']/i);
  const metaDescription = (metaDesc?.[1] || ogDesc?.[1] || '').trim();

  // Headings (h1–h6)
  const headings: { level: number; text: string }[] = [];
  const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m;
  while ((m = headingRegex.exec(clean)) !== null) {
    const text = stripTags(m[2]);
    if (text.length > 2 && text.length < 200) {
      headings.push({ level: parseInt(m[1]), text });
    }
  }

  // Paragraphs
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  while ((m = pRegex.exec(clean)) !== null) {
    const text = stripTags(m[1]);
    if (text.length > 20 && text.length < 2000) {
      paragraphs.push(text);
    }
  }

  // Nav links
  const navLinks: { label: string; href: string }[] = [];
  const navRegex = /<nav[^>]*>([\s\S]*?)<\/nav>/gi;
  while ((m = navRegex.exec(clean)) !== null) {
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(m[1])) !== null) {
      const href = linkMatch[1].trim();
      const label = stripTags(linkMatch[2]);
      if (label && label.length < 40 && href && !href.startsWith('javascript:')) {
        navLinks.push({ label, href: resolveUrl(href, baseUrl) || href });
      }
    }
  }

  // CTA buttons
  const ctaButtons: { label: string; href: string }[] = [];
  const btnPattern = /<(?:a|button)[^>]*class=["'][^"']*(?:btn|button|cta|primary|action)[^"']*["'][^>]*>(.*?)<\/(?:a|button)>/gi;
  while ((m = btnPattern.exec(clean)) !== null) {
    const label = stripTags(m[1]);
    const hrefMatch = m[0].match(/href=["']([^"']*)["']/);
    const href = hrefMatch ? hrefMatch[1] : '#';
    if (label && label.length > 1 && label.length < 50) {
      ctaButtons.push({ label, href });
    }
  }
  // Also look for <a> tags with strong action words
  const actionRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  while ((m = actionRegex.exec(clean)) !== null) {
    const label = stripTags(m[2]);
    if (/get started|contact us|book now|sign up|free trial|learn more|schedule|request|quote/i.test(label)) {
      ctaButtons.push({ label, href: m[1] });
    }
  }

  // Services
  const services = extractListFromSection(clean, /service|offering|what[-\s]we[-\s]do|our[-\s]work|solution/i);

  // Features
  const features = extractListFromSection(clean, /feature|benefit|advantage|why[-\s]choose|why[-\s]us|what[-\s]sets/i);

  // Testimonials
  const testimonials = extractTestimonials(clean);

  // Pricing text
  const pricingText = extractPricingText(clean);

  // FAQ
  const faqItems = extractFAQ(clean);

  // About content
  const aboutContent = extractSectionContent(clean, /about|who[-\s]we[-\s]are|our[-\s]story|our[-\s]mission/i);

  // Footer content & contact from footer
  const { footerContent, footerEmail, footerPhone, footerAddress } = extractFooterContent(clean);

  return {
    title,
    metaDescription,
    headings,
    paragraphs,
    navLinks,
    ctaButtons,
    services,
    features,
    testimonials,
    pricingText,
    faqItems,
    aboutContent,
    footerContent,
    footerEmail,
    footerPhone,
    footerAddress,
  };
}

function extractListFromSection(html: string, sectionPattern: RegExp): string[] {
  const items: Set<string> = new Set();

  // Find sections matching the pattern in class or id
  const sectionRegex = new RegExp(
    `<(?:section|div)[^>]*(?:class|id)=["'][^"']*(?:${sectionPattern.source})[^"']*["'][^>]*>([\\s\\S]{0,8000}?)<\\/(?:section|div)>`,
    'gi'
  );
  let m;
  while ((m = sectionRegex.exec(html)) !== null) {
    const content = m[1];
    // h3–h5 cards
    const headingItems = content.match(/<h[3-5][^>]*>([\s\S]*?)<\/h[3-5]>/gi);
    if (headingItems) {
      headingItems.forEach(h => {
        const text = stripTags(h);
        if (text.length > 3 && text.length < 80) items.add(text);
      });
    }
    // List items
    const listItems = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (listItems) {
      listItems.forEach(li => {
        const text = stripTags(li);
        if (text.length > 3 && text.length < 100) items.add(text);
      });
    }
  }

  // Also look for heading that CONTAINS the keyword, then grab siblings
  if (items.size === 0) {
    const headingRegex = new RegExp(
      `<h[2-3][^>]*>[^<]*(?:${sectionPattern.source})[^<]*<\\/h[2-3]>([\\s\\S]{0,5000}?)(?=<h[2-3]|<footer|$)`,
      'gi'
    );
    while ((m = headingRegex.exec(html)) !== null) {
      const content = m[1];
      const subHeadings = content.match(/<h[3-5][^>]*>([\s\S]*?)<\/h[3-5]>/gi);
      if (subHeadings) {
        subHeadings.forEach(h => {
          const text = stripTags(h);
          if (text.length > 3 && text.length < 80) items.add(text);
        });
      }
    }
  }

  return Array.from(items).slice(0, 10);
}

function extractTestimonials(html: string): Testimonial[] {
  const testimonials: Testimonial[] = [];

  // Pattern 1: sections with testimonial/review/feedback in class/id
  const testimonialRegex = /<[^>]+(?:class|id)=["'][^"']*(?:testimonial|review|feedback|quote|client)[^"']*["'][^>]*>([\s\S]{20,3000}?)<\/(?:section|div|article|li|blockquote)>/gi;
  let m;
  while ((m = testimonialRegex.exec(html)) !== null && testimonials.length < 6) {
    const content = m[1];
    // Extract quote
    const quoteMatch =
      content.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i) ||
      content.match(/<q[^>]*>([\s\S]*?)<\/q>/i) ||
      content.match(/<p[^>]*>([\s\S]{20,500}?)<\/p>/i);
    // Extract author
    const nameMatch =
      content.match(/<[^>]+(?:class|id)=["'][^"']*(?:name|author|cite|credit|reviewer)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i) ||
      content.match(/<cite[^>]*>([\s\S]*?)<\/cite>/i) ||
      content.match(/<strong[^>]*>([^<]{3,40})<\/strong>/i);
    // Extract role/title
    const roleMatch = content.match(/<[^>]+(?:class|id)=["'][^"']*(?:role|title|position|job|company)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/i);
    // Extract avatar
    const avatarMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);

    if (quoteMatch) {
      const text = stripTags(quoteMatch[1]);
      if (text.length > 15) {
        testimonials.push({
          name: nameMatch ? stripTags(nameMatch[1]) : 'Customer',
          text,
          rating: 5,
        });
      }
    }
  }

  // Pattern 2: multiple blockquotes (common pattern)
  if (testimonials.length === 0) {
    const bqRegex = /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi;
    while ((m = bqRegex.exec(html)) !== null && testimonials.length < 6) {
      const text = stripTags(m[1]);
      if (text.length > 20 && text.length < 500) {
        testimonials.push({ name: 'Customer', text, rating: 5 });
      }
    }
  }

  return testimonials;
}

function extractPricingText(html: string): string[] {
  const pricing: string[] = [];
  // Look for price patterns
  const priceRegex = /(?:\$|€|£|USD|EUR|GBP)\s*[\d,.]+(?:\s*\/\s*\w+)?/gi;
  let m;
  while ((m = priceRegex.exec(html)) !== null && pricing.length < 20) {
    pricing.push(m[0].trim());
  }
  return [...new Set(pricing)].slice(0, 10);
}

function extractFAQ(html: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];

  // Pattern 1: FAQ section with class/id
  const faqRegex = /<[^>]+(?:class|id)=["'][^"']*faq[^"']*["'][^>]*>([\s\S]{0,10000}?)<\/(?:section|div)>/gi;
  let m;
  while ((m = faqRegex.exec(html)) !== null) {
    // details/summary pattern
    const dsRegex = /<summary[^>]*>([\s\S]*?)<\/summary>[\s\S]*?<(?:p|div)[^>]*>([\s\S]*?)<\/(?:p|div)>/gi;
    let qm;
    while ((qm = dsRegex.exec(m[1])) !== null && faqs.length < 8) {
      faqs.push({ question: stripTags(qm[1]), answer: stripTags(qm[2]) });
    }
    // dt/dd pattern
    const ddRegex = /<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi;
    while ((qm = ddRegex.exec(m[1])) !== null && faqs.length < 8) {
      faqs.push({ question: stripTags(qm[1]), answer: stripTags(qm[2]) });
    }
    // h3+p or h4+p pattern
    const hpRegex = /<h[3-5][^>]*>([\s\S]*?)<\/h[3-5]>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
    while ((qm = hpRegex.exec(m[1])) !== null && faqs.length < 8) {
      const q = stripTags(qm[1]);
      const a = stripTags(qm[2]);
      if (q.includes('?') || a.length > 20) {
        faqs.push({ question: q, answer: a });
      }
    }
  }

  // Pattern 2: Look for accordion-like patterns with "question" class
  if (faqs.length === 0) {
    const accRegex = /<[^>]+class=["'][^"']*(?:accordion|question|faq-item)[^"']*["'][^>]*>([\s\S]{0,2000}?)<\/(?:div|li|article)>/gi;
    while ((m = accRegex.exec(html)) !== null && faqs.length < 8) {
      const headingMatch = m[1].match(/<[^>]+>([\s\S]*?)<\/[^>]+>/);
      const bodyMatch = m[1].match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      if (headingMatch && bodyMatch) {
        faqs.push({ question: stripTags(headingMatch[1]), answer: stripTags(bodyMatch[1]) });
      }
    }
  }

  return faqs.slice(0, 8);
}

function extractSectionContent(html: string, sectionPattern: RegExp): string {
  // Try matching sections by class/id
  const sectionRegex = new RegExp(
    `<(?:section|div|article)[^>]*(?:class|id)=["'][^"']*(?:${sectionPattern.source})[^"']*["'][^>]*>([\\s\\S]{0,5000}?)<\\/(?:section|div|article)>`,
    'i'
  );
  const m = html.match(sectionRegex);
  if (m) {
    const pTags = m[1].match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    if (pTags) {
      return pTags.map(p => stripTags(p)).filter(t => t.length > 20).join(' ').slice(0, 1500);
    }
    return stripTags(m[1]).slice(0, 1000);
  }
  return '';
}

function extractFooterContent(html: string): { footerContent: string; footerEmail: string | null; footerPhone: string | null; footerAddress: string | null } {
  const footerMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
  if (!footerMatch) return { footerContent: '', footerEmail: null, footerPhone: null, footerAddress: null };

  const content = footerMatch[1];
  const text = stripTags(content).slice(0, 500);

  // Extract contact from footer specifically
  // Email - prioritize mailto links
  let footerEmail: string | null = null;
  const mailtoMatch = content.match(/href=["']mailto:([^"'?]+)/i);
  if (mailtoMatch) {
    footerEmail = mailtoMatch[1].toLowerCase().trim();
  } else {
    const emailMatch = content.match(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/);
    if (emailMatch) {
      const email = emailMatch[1].toLowerCase().trim();
      // Filter common false positives
      if (!email.includes('example.com') && !email.includes('test.com') && !email.endsWith('.png') && !email.endsWith('.jpg')) {
        footerEmail = email;
      }
    }
  }

  // Phone - international support
  let footerPhone: string | null = null;
  const telMatch = content.match(/href=["']tel:([^"']+)["']/i);
  if (telMatch) {
    footerPhone = telMatch[1].trim();
  } else {
    // Try multiple international patterns
    const phonePatterns = [
      /\+92[-\s]?\d{3}[-\s]?\d{7}/,     // Pakistan
      /\b0\d{3}[-\s]?\d{7}\b/,           // Pakistani mobile
      /\+\d{1,4}[-\s]?\(?\d{1,4}\)?[-\s]?\d{1,4}[-\s]?\d{1,9}/, // International
      /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/, // US/Canada
    ];
    
    for (const pattern of phonePatterns) {
      const match = content.match(pattern);
      if (match) {
        footerPhone = match[0].replace(/\s+/g, ' ').trim();
        break;
      }
    }
  }

  // Address - check multiple sources
  let footerAddress: string | null = null;
  const addressMatch = content.match(/<address[^>]*>([\s\S]{10,200}?)<\/address>/i) ||
                       content.match(/<[^>]+(?:class|id)=["'][^"']*address[^"']*["'][^>]*>([\s\S]{10,200}?)<\/[^>]+>/i);
  if (addressMatch) {
    footerAddress = stripTags(addressMatch[1])
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 250);
  }

  console.log(`[extractFooterContent] Footer contact - Phone: ${footerPhone || 'none'}, Email: ${footerEmail || 'none'}, Address: ${footerAddress ? 'found' : 'none'}`);

  return {
    footerContent: text,
    footerEmail,
    footerPhone,
    footerAddress,
  };
}

// ==================== SHOPIFY API EXTRACTION ====================

async function extractShopifyProducts(baseUrl: string): Promise<Array<{
  name: string;
  description?: string;
  price?: number;
  salePrice?: number;
  image?: string;
  category?: string;
}>> {
  const products: Array<{
    name: string;
    description?: string;
    price?: number;
    salePrice?: number;
    image?: string;
    category?: string;
  }> = [];

  try {
    // Try Shopify products.json API (standard endpoint for all Shopify stores)
    const productsUrl = `${baseUrl}/products.json?limit=50`;
    console.log(`[Shopify] Trying API: ${productsUrl}`);
    
    const response = await fetchWithRetry(productsUrl);
    if (!response) return products;

    const text = await response.text();
    const data = JSON.parse(text);
    
    if (data.products && Array.isArray(data.products)) {
      console.log(`[Shopify] Found ${data.products.length} products via API`);
      
      for (const product of data.products) {
        if (!product.title) continue;
        
        const variant = product.variants?.[0] || {};
        const image = product.images?.[0]?.src || product.image?.src;
        
        // Clean HTML from description
        let description = product.body_html || '';
        description = description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        description = description.substring(0, 300);
        
        products.push({
          name: product.title,
          description: description || undefined,
          price: variant.price ? parseFloat(variant.price) : undefined,
          salePrice: variant.compare_at_price ? parseFloat(variant.compare_at_price) : undefined,
          image: image,
          category: product.product_type || product.vendor || undefined,
        });
        
        if (products.length >= 50) break;
      }
    }
  } catch (error) {
    console.log('[Shopify] API extraction failed, will try HTML scraping');
  }

  return products;
}

// ==================== HTML PRODUCT EXTRACTION ====================

function extractProducts(html: string, baseUrl: string): Array<{
  name: string;
  description?: string;
  price?: number;
  salePrice?: number;
  image?: string;
  category?: string;
}> {
  const products: Array<{
    name: string;
    description?: string;
    price?: number;
    salePrice?: number;
    image?: string;
    category?: string;
  }> = [];
  const seen = new Set<string>();

  // Try JSON-LD structured data first (most reliable)
  const ldJsonMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of ldJsonMatches) {
    try {
      const data = JSON.parse(match[1]);
      const productItems: any[] = [];
      
      if (data['@type'] === 'Product') {
        productItems.push(data);
      } else if (Array.isArray(data['@graph'])) {
        productItems.push(...data['@graph'].filter((item: any) => item['@type'] === 'Product'));
      } else if (data['@type'] === 'ItemList' && Array.isArray(data.itemListElement)) {
        productItems.push(...data.itemListElement.filter((item: any) => item['@type'] === 'Product' || item.item?.['@type'] === 'Product'));
      }

      for (const product of productItems) {
        const item = product['@type'] === 'Product' ? product : product.item;
        if (!item || !item.name) continue;
        
        const name = stripTags(String(item.name));
        if (seen.has(name)) continue;
        seen.add(name);

        const priceObj = item.offers?.[0] || item.offers;
        const price = priceObj?.price ? parseFloat(String(priceObj.price)) : undefined;
        
        products.push({
          name,
          description: item.description ? stripTags(String(item.description)).slice(0, 200) : undefined,
          price,
          image: Array.isArray(item.image) ? item.image[0] : item.image,
          category: item.category || item.brand?.name,
        });
      }
    } catch {}
  }

  // Try ecommerce platform-specific patterns
  const clean = cleanHtml(html);

  // Pattern 1: Product cards with data attributes (Shopify, WooCommerce)
  const dataProductRegex = /<[^>]*data-product-(?:id|handle|name)=[^>]*>([\s\S]{0,2000}?)<\/(?:div|article|li)>/gi;
  let m;
  while ((m = dataProductRegex.exec(clean)) !== null && products.length < 50) {
    const cardHtml = m[1];
    const nameMatch = 
      cardHtml.match(/<(?:h[2-5]|a)[^>]*class="[^"]*(?:product[-_]title|name|heading)[^"]*"[^>]*>([^<]+)/i) ||
      cardHtml.match(/<(?:h[2-5])[^>]*>([^<]+)<\/h[2-5]>/i);
    const priceMatch = cardHtml.match(/<[^>]*class="[^"]*(?:price|cost|amount)[^"]*"[^>]*>[^\d]*([\d,.]+)/i);
    const imgMatch = 
      cardHtml.match(/<img[^>]*(?:data-src|data-lazy-src|data-original)=["']([^"']+)["']/i) ||
      cardHtml.match(/<img[^>]*src=["']([^"']+)["']/i);
    const categoryMatch = cardHtml.match(/<[^>]*class="[^"]*category[^"]*"[^>]*>([^<]+)/i);

    if (nameMatch) {
      const name = stripTags(nameMatch[1]);
      if (seen.has(name) || name.length < 3 || name.length > 150) continue;
      seen.add(name);

      products.push({
        name,
        price: priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : undefined,
        image: imgMatch ? resolveUrl(imgMatch[1], baseUrl) : undefined,
        category: categoryMatch ? stripTags(categoryMatch[1]) : undefined,
      });
    }
  }

  // Pattern 2: Generic product cards
  const productCardRegex = /<(?:div|article|li)[^>]*class="[^"]*(?:product[-_](?:card|item|box)|item[-_]product|product)[^"]*"[^>]*>([\s\S]{0,2000}?)<\/(?:div|article|li)>/gi;
  while ((m = productCardRegex.exec(clean)) !== null && products.length < 50) {
    const cardHtml = m[1];
    const nameMatch = 
      cardHtml.match(/<(?:h[2-5]|a|span)[^>]*class="[^"]*(?:title|name|product[-_]name)[^"]*"[^>]*>([^<]+)/i) ||
      cardHtml.match(/<(?:h[2-5]|a)[^>]*>([^<]{3,100})<\/(?:h[2-5]|a)>/i);
    const priceMatch = 
      cardHtml.match(/<[^>]*class="[^"]*(?:sale[-_]price|price[-_]sale)[^"]*"[^>]*>[^\d]*([\d,.]+)/i) ||
      cardHtml.match(/<[^>]*class="[^"]*price[^"]*"[^>]*>[^\d]*([\d,.]+)/i);
    const imgMatch = 
      cardHtml.match(/<img[^>]*(?:data-src|data-lazy-src|data-original)=["']([^"']+)["']/i) ||
      cardHtml.match(/<img[^>]*src=["']([^"']+)["']/i);

    if (nameMatch) {
      const name = stripTags(nameMatch[1]);
      if (seen.has(name) || name.length < 3 || name.length > 150) continue;
      seen.add(name);

      products.push({
        name,
        price: priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : undefined,
        image: imgMatch ? resolveUrl(imgMatch[1], baseUrl) : undefined,
      });
    }
  }

  // Pattern 3: Grid items that look like products
  const gridItemRegex = /<(?:div|article)[^>]*class="[^"]*(?:grid|col|item)[^"]*"[^>]*>[\s\S]*?<img[^>]*(?:data-src|data-lazy-src|data-original|src)="([^"]+)"[\s\S]*?<(?:h[3-6]|a|div)[^>]*>([^<]{3,100})<[\s\S]{0,300}?(?:[\$\£\€]\s*[\d,.]+|<[^>]*class="[^"]*price[^"]*"[^>]*>[^\d]*([\d,.]+))/gi;
  while ((m = gridItemRegex.exec(clean)) !== null && products.length < 50) {
    const name = stripTags(m[2]);
    if (seen.has(name) || name.length < 3) continue;
    seen.add(name);

    products.push({
      name,
      price: m[3] ? parseFloat(m[3].replace(/,/g, '')) : undefined,
      image: resolveUrl(m[1], baseUrl),
    });
  }

  // Pattern 4: Any div/article with an image and heading (fallback for complex layouts)
  if (products.length < 10) {
    const fallbackRegex = /<(?:div|article|li)[^>]*>[\s\S]{0,1500}?<img[^>]*(?:src|data-src)=["']([^"']+)["'][^>]*[\s\S]{0,500}?<(?:h[2-6]|a|span)[^>]*class="[^"]*(?:product|title|name)[^"]*"[^>]*>([^<]{3,120})</gi;
    while ((m = fallbackRegex.exec(clean)) !== null && products.length < 50) {
      const name = stripTags(m[2]);
      if (seen.has(name) || name.length < 3 || name.length > 120) continue;
      seen.add(name);

      const imgUrl = resolveUrl(m[1], baseUrl);
      // Skip placeholder/icon images
      if (imgUrl.includes('placeholder') || imgUrl.includes('icon') || imgUrl.includes('loading')) continue;

      products.push({
        name,
        image: imgUrl,
      });
    }
  }

  // Pattern 5: Reverse pattern - heading first, then image
  if (products.length < 10) {
    const reverseRegex = /<(?:h[2-6]|a|div)[^>]*class="[^"]*(?:product|title|name)[^"]*"[^>]*>([^<]{3,120})<[\s\S]{0,500}?<img[^>]*(?:src|data-src)=["']([^"']+)["']/gi;
    while ((m = reverseRegex.exec(clean)) !== null && products.length < 50) {
      const name = stripTags(m[1]);
      if (seen.has(name) || name.length < 3 || name.length > 120) continue;
      seen.add(name);

      const imgUrl = resolveUrl(m[2], baseUrl);
      if (imgUrl.includes('placeholder') || imgUrl.includes('icon') || imgUrl.includes('loading')) continue;

      products.push({
        name,
        image: imgUrl,
      });
    }
  }

  return products.slice(0, 50); // Max 50 products
}

// ==================== MENU ITEMS EXTRACTION (for Restaurants) ====================

function extractMenuItems(html: string, baseUrl: string): Array<{
  name: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
}> {
  const items: Array<{
    name: string;
    description?: string;
    price?: number;
    image?: string;
    category?: string;
  }> = [];
  const seen = new Set<string>();
  
  // Pattern 1: Menu item containers (common in restaurant sites)
  const menuItemRegex = /<(?:div|article|li)[^>]*class="[^"]*(?:menu[-_]item|dish|food[-_]item)[^"]*"[^>]*>([\s\S]{0,2000}?)<\/(?:div|article|li)>/gi;
  let m;
  while ((m = menuItemRegex.exec(html)) !== null && items.length < 50) {
    const itemHtml = m[1];
    const nameMatch = 
      itemHtml.match(/<(?:h[3-6]|div|span)[^>]*class="[^"]*(?:name|title|dish)[^"]*"[^>]*>([^<]+)/i) ||
      itemHtml.match(/<(?:h[3-6])[^>]*>([^<]+)<\/h[3-6]>/i);
    const descMatch = itemHtml.match(/<(?:p|div|span)[^>]*class="[^"]*(?:desc|ingredients)[^"]*"[^>]*>([^<]{10,200})/i);
    const priceMatch = itemHtml.match(/[\$\£\€]\s*([\d,.]+)|<[^>]*class="[^"]*price[^"]*"[^>]*>[\$\£\€]?\s*([\d,.]+)/i);
    const imgMatch = itemHtml.match(/<img[^>]*src="([^"]+)"/i);
    
    if (nameMatch) {
      const name = stripTags(nameMatch[1]);
      if (seen.has(name) || name.length < 3 || name.length > 100) continue;
      seen.add(name);
      
      items.push({
        name,
        description: descMatch ? stripTags(descMatch[1]).slice(0, 200) : undefined,
        price: priceMatch ? parseFloat((priceMatch[1] || priceMatch[2]).replace(/,/g, '')) : undefined,
        image: imgMatch ? resolveUrl(imgMatch[1], baseUrl) : undefined,
      });
    }
  }
  
  // Pattern 2: JSON-LD menu data (schema.org/Menu)
  const ldJsonMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of ldJsonMatches) {
    try {
      const data = JSON.parse(match[1]);
      if (data['@type'] === 'Menu' || data['@type'] === 'MenuSection') {
        const menuItems = data.hasMenuSection || data.hasMenuItem || [];
        for (const item of menuItems) {
          if (item.name && !seen.has(item.name)) {
            seen.add(item.name);
            items.push({
              name: item.name,
              description: item.description,
              price: item.offers?.price ? parseFloat(item.offers.price) : undefined,
              image: item.image,
              category: item.menuSection || undefined,
            });
          }
        }
      }
    } catch {}
  }
  
  return items.slice(0, 50);
}

// ==================== SOCIAL MEDIA CONTENT EXTRACTION ====================

function extractSocialMediaContent(html: string, url: string): {
  posts: Array<{ text: string; image?: string }>;
  highlights: string[];
  bio: string;
} {
  const result = {
    posts: [] as Array<{ text: string; image?: string }>,
    highlights: [] as string[],
    bio: '',
  };
  
  // Instagram-specific extraction
  if (url.includes('instagram.com')) {
    // Bio from meta tags
    const bioMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
    if (bioMatch) result.bio = stripTags(bioMatch[1]);
    
    // Highlights from text
    const highlightMatches = html.matchAll(/#(\w+)/g);
    result.highlights = Array.from(new Set(Array.from(highlightMatches).map(m => m[1]))).slice(0, 10);
  }
  
  // Facebook page extraction
  if (url.includes('facebook.com')) {
    const aboutMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
    if (aboutMatch) result.bio = stripTags(aboutMatch[1]);
  }
  
  return result;
}

// ==================== CONTACT EXTRACTION ====================

function extractContact(html: string): ContactInfo {
  console.log('[extractContact] Starting contact extraction...');

  // Phone — Enhanced extraction with international support (US, UK, Pakistan, India, etc.)
  const telMatch = html.match(/href=["']tel:([^"']+)["']/i);
  let phone: string | null = null;
  
  if (telMatch) {
    phone = telMatch[1].trim();
    console.log(`[extractContact] Found phone in tel: link: ${phone}`);
  } else {
    // Multiple international phone patterns
    const phonePatterns = [
      // Pakistan: +92-XXX-XXXXXXX, +92 XXX XXXXXXX, 03XX-XXXXXXX
      /\+92[-\s]?\d{3}[-\s]?\d{7}/g,
      /\b0\d{3}[-\s]?\d{7}\b/g, // Pakistani mobile without country code
      // International with country code: +XX XXX XXX XXXX
      /\+\d{1,4}[-\s]?\(?\d{1,4}\)?[-\s]?\d{1,4}[-\s]?\d{1,9}/g,
      // US/Canada: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXX.XXX.XXXX
      /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      // UK: +44 XXXX XXXXXX, 0XXXX XXXXXX
      /\+44[-\s]?\d{4}[-\s]?\d{6}/g,
      /\b0\d{4}[-\s]?\d{6}\b/g,
      // India: +91 XXXXX XXXXX, 0XX XXXX XXXX
      /\+91[-\s]?\d{5}[-\s]?\d{5}/g,
      // Generic: at least 10 digits with optional formatting
      /\b\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,
    ];

    const allPhoneMatches: string[] = [];
    for (const pattern of phonePatterns) {
      const matches = html.match(pattern);
      if (matches) {
        allPhoneMatches.push(...matches);
      }
    }

    // Filter valid phones (remove duplicates, invalid formats)
    const validPhones = allPhoneMatches
      .map(p => p.trim())
      .filter((p, idx, arr) => {
        // Remove pure digits that look like years, codes, etc.
        const digitsOnly = p.replace(/[^\d]/g, '');
        if (digitsOnly.length < 7 || digitsOnly.length > 15) return false;
        // Remove duplicates
        return arr.indexOf(p) === idx;
      })
      .filter(p => {
        // Filter out obvious non-phones (years, IDs, etc.)
        const cleaned = p.replace(/[^\d]/g, '');
        return !/^(19|20)\d{2}$/.test(cleaned) && // Not a year
               !/^[0-9]{1,6}$/.test(cleaned);      // Not too short
      });

    if (validPhones.length > 0) {
      phone = validPhones[0]; // Take the first valid phone
      console.log(`[extractContact] Found ${validPhones.length} phone(s): ${validPhones.join(', ')}`);
    }
  }

  // Normalize phone format (keep country code and formatting)
  if (phone) {
    // Keep + sign and remove excessive spaces/symbols
    phone = phone.replace(/\s+/g, ' ').replace(/[^\d+\s()-]/g, '').trim();
    console.log(`[extractContact] Normalized phone: ${phone}`);
  }

  // Email — look for mailto: first, then patterns with validation
  const mailtoMatch = html.match(/href=["']mailto:([^"'?]+)/i);
  let email: string | null = null;
  
  if (mailtoMatch) {
    email = mailtoMatch[1].toLowerCase().trim();
    console.log(`[extractContact] Found email in mailto: ${email}`);
  } else {
    const emailRegex = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g;
    const emailMatches = html.match(emailRegex) || [];
    
    // Filter out common false positives
    const validEmails = emailMatches
      .map(e => e.toLowerCase().trim())
      .filter(e =>
        !e.includes('example.com') &&
        !e.includes('sentry') &&
        !e.includes('webpack') &&
        !e.includes('wixpress') &&
        !e.includes('schema.org') &&
        !e.includes('localhost') &&
        !e.includes('test.com') &&
        !e.includes('placeholder') &&
        !e.endsWith('.png') &&
        !e.endsWith('.jpg') &&
        !e.endsWith('.svg')
      );
    
    if (validEmails.length > 0) {
      email = validEmails[0];
      console.log(`[extractContact] Found ${validEmails.length} email(s): ${validEmails.join(', ')}`);
    }
  }

  // Address — Enhanced extraction with multiple strategies
  let address: string | null = null;
  
  // Strategy 1: Schema.org structured data
  const schemaAddress = html.match(/"streetAddress"\s*:\s*"([^"]+)"/i);
  const schemaCity = html.match(/"addressLocality"\s*:\s*"([^"]+)"/i);
  const schemaRegion = html.match(/"addressRegion"\s*:\s*"([^"]+)"/i);
  const schemaPostal = html.match(/"postalCode"\s*:\s*"([^"]+)"/i);
  const schemaCountry = html.match(/"addressCountry"\s*:\s*"([^"]+)"/i);
  
  if (schemaAddress) {
    const parts = [
      schemaAddress[1],
      schemaCity?.[1],
      schemaRegion?.[1],
      schemaPostal?.[1],
      schemaCountry?.[1]
    ].filter(Boolean);
    address = parts.join(', ');
    console.log(`[extractContact] Found schema.org address: ${address}`);
  } 
  
  // Strategy 2: <address> tag
  if (!address) {
    const addressTagMatch = html.match(/<address[^>]*>([\s\S]{10,500}?)<\/address>/i);
    if (addressTagMatch) {
      address = stripTags(addressTagMatch[1])
        .replace(/\s+/g, ' ')
        .replace(/\n/g, ', ')
        .trim()
        .slice(0, 300);
      console.log(`[extractContact] Found <address> tag: ${address}`);
    }
  }
  
  // Strategy 3: Elements with "address" class/id
  if (!address) {
    const addressClassMatch = html.match(/<[^>]+(?:class|id)=["'][^"']*address[^"']*["'][^>]*>([\s\S]{10,500}?)<\/[^>]+>/i);
    if (addressClassMatch) {
      address = stripTags(addressClassMatch[1])
        .replace(/\s+/g, ' ')
        .replace(/\n/g, ', ')
        .trim()
        .slice(0, 300);
      console.log(`[extractContact] Found address by class/id: ${address}`);
    }
  }

  // Strategy 4: Common address patterns in text
  if (!address) {
    // Look for patterns like: Street, City, State ZIP or City, Country
    const addressPatterns = [
      // With street number: 123 Main St, City, State 12345
      /\b\d+\s+[A-Z][a-zA-Z\s]{3,30},\s*[A-Z][a-zA-Z\s]{3,20}(?:,\s*[A-Z]{2,20})?\s*\d{4,6}\b/g,
      // City, State/Province, Country
      /\b[A-Z][a-zA-Z\s]{3,20},\s*[A-Z][a-zA-Z\s]{3,20},\s*[A-Z][a-zA-Z\s]{3,20}\b/g,
    ];

    for (const pattern of addressPatterns) {
      const match = stripTags(html).match(pattern);
      if (match && match[0].length > 15) {
        address = match[0].trim();
        console.log(`[extractContact] Found address by pattern: ${address}`);
        break;
      }
    }
  }

  // Clean up address formatting
  if (address) {
    address = address
      .replace(/\s+/g, ' ')
      .replace(/,\s*,/g, ',')
      .replace(/^\s*,\s*|\s*,\s*$/g, '')
      .trim();
    
    // If address is too short or just repeated words, discard it
    if (address.length < 10 || /^(\w+\s*){1,2}$/.test(address)) {
      console.log(`[extractContact] Address too short or invalid, discarding: ${address}`);
      address = null;
    } else {
      console.log(`[extractContact] Final address: ${address}`);
    }
  }

  // Social links
  const socialLinks: SocialLinks = {};
  const socialPatterns: Partial<Record<keyof SocialLinks, RegExp>> = {
    instagram: /https?:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9_.]+/i,
    facebook: /https?:\/\/(?:www\.)?facebook\.com\/[a-zA-Z0-9_.]+/i,
    twitter: /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[a-zA-Z0-9_]+/i,
    linkedin: /https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[a-zA-Z0-9_-]+/i,
    youtube: /https?:\/\/(?:www\.)?youtube\.com\/(?:c\/|channel\/|@)?[a-zA-Z0-9_-]+/i,
    tiktok: /https?:\/\/(?:www\.)?tiktok\.com\/@[a-zA-Z0-9_.]+/i,
  };
  
  for (const [platform, pattern] of Object.entries(socialPatterns)) {
    const match = html.match(pattern);
    if (match) {
      socialLinks[platform as keyof SocialLinks] = match[0];
    }
  }

  console.log(`[extractContact] Extraction complete - Phone: ${phone || 'none'}, Email: ${email || 'none'}, Address: ${address ? 'found' : 'none'}, Social: ${Object.keys(socialLinks).length} platforms`);

  return { phone, email, address, socialLinks };
}

// ==================== COLOR EXTRACTION ====================

function extractColors(html: string): { primary: string; secondary: string } {
  const colors: string[] = [];
  const brandColors: string[] = []; // Colors with high brand affinity

  // Theme-color meta tag (high priority - this is a brand color)
  const themeColor = html.match(/<meta\s+name=["']theme-color["']\s+content=["']([^"']+)["']/i);
  if (themeColor) {
    colors.push(themeColor[1]);
    brandColors.push(themeColor[1]);
  }

  // CSS custom properties (--primary, --brand, etc.) - high priority
  const cssVarRegex = /--(?:primary|brand|main|accent|theme|secondary)[-\w]*:\s*([^;]+)/gi;
  let m;
  while ((m = cssVarRegex.exec(html)) !== null) {
    colors.push(m[1].trim());
    brandColors.push(m[1].trim());
  }

  // Button and link colors (often brand colors) - high priority
  const btnColorRegex = /\.(?:btn|button|link|cta|primary|brand)[^{]*\{[^}]*(?:background-)?color:\s*([^;]+)/gi;
  while ((m = btnColorRegex.exec(html)) !== null) {
    colors.push(m[1].trim());
    brandColors.push(m[1].trim());
  }

  // Background colors from inline styles
  const bgColorRegex = /background(?:-color)?:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\)|[a-z]+)/gi;
  while ((m = bgColorRegex.exec(html)) !== null) {
    colors.push(m[1]);
  }

  // Color values from inline styles
  const colorRegex = /[^-]color:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\)|[a-z]+)/gi;
  while ((m = colorRegex.exec(html)) !== null) {
    colors.push(m[1]);
  }

  // Normalize all colors
  const allValidHex = colors
    .map(c => normalizeToHex(c))
    .filter((c): c is string => !!c);

  // Normalize brand colors separately (allow dark colors here)
  const validBrandHex = brandColors
    .map(c => normalizeToHex(c))
    .filter((c): c is string => !!c && !isGrayscale(c));

  // Filter non-brand colors (exclude very dark and grayscale)
  const validRegularHex = allValidHex
    .filter(c => !isGrayscale(c) && !isVeryDark(c));

  // Combine: prioritize brand colors, then frequent colors
  const allColors = [...validBrandHex, ...validRegularHex];

  // Count frequency
  const freq = new Map<string, number>();
  allColors.forEach(c => freq.set(c.toLowerCase(), (freq.get(c.toLowerCase()) || 0) + 1));
  
  // Sort by frequency
  const sorted = Array.from(freq.entries())
    .sort((a, b) => {
      // Boost score if it's a brand color
      const aIsBrand = validBrandHex.some(bc => bc.toLowerCase() === a[0]);
      const bIsBrand = validBrandHex.some(bc => bc.toLowerCase() === b[0]);
      const aScore = b[1] + (aIsBrand ? 10 : 0);
      const bScore = a[1] + (bIsBrand ? 10 : 0);
      return bScore - aScore;
    })
    .map(([c]) => c);

  // Fallback to popular brand colors if nothing found
  const defaultPrimary = sorted[0] || '#3b82f6'; // Blue
  const defaultSecondary = sorted.find(c => !areSimilar(c, defaultPrimary)) || '#8b5cf6'; // Purple

  console.log(`[extractColors] Found ${sorted.length} colors, top 5:`, sorted.slice(0, 5));
  console.log(`[extractColors] Brand colors:`, validBrandHex);
  console.log(`[extractColors] Selected: Primary=${defaultPrimary}, Secondary=${defaultSecondary}`);

  return {
    primary: defaultPrimary,
    secondary: defaultSecondary,
  };
}

function isVeryDark(color: string): boolean {
  const hex = normalizeToHex(color);
  if (!hex) return false;
  
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Calculate luminance - colors darker than 20% are considered too dark
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.2;
}

function normalizeToHex(color: string): string | null {
  color = color.trim().toLowerCase();
  
  // Already hex format
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  
  // Short hex format
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }
  
  // RGB/RGBA format
  const rgb = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) {
    const r = parseInt(rgb[1]);
    const g = parseInt(rgb[2]);
    const b = parseInt(rgb[3]);
    
    // Validate RGB values
    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
      return '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('');
    }
  }
  
  // Named colors mapping (common brand colors)
  const namedColors: Record<string, string> = {
    'red': '#ff0000',
    'blue': '#0000ff',
    'green': '#008000',
    'yellow': '#ffff00',
    'purple': '#800080',
    'pink': '#ffc0cb',
    'orange': '#ffa500',
    'cyan': '#00ffff',
    'magenta': '#ff00ff',
    'navy': '#000080',
    'teal': '#008080',
    'coral': '#ff7f50',
    'gold': '#ffd700',
    'black': '#000000',
    'white': '#ffffff',
    'gray': '#808080',
    'grey': '#808080',
    'silver': '#c0c0c0',
    'maroon': '#800000',
    'olive': '#808000',
    'lime': '#00ff00',
    'aqua': '#00ffff',
    'fuchsia': '#ff00ff',
  };
  
  if (namedColors[color]) {
    return namedColors[color];
  }
  
  return null;
}

function isGrayscale(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  // Allow pure black and white as they can be brand colors
  if ((r === 0 && g === 0 && b === 0) || (r === 255 && g === 255 && b === 255)) return false;
  return Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(b - r)) < 30;
}

function areSimilar(a: string, b: string): boolean {
  const r1 = parseInt(a.slice(1, 3), 16), g1 = parseInt(a.slice(3, 5), 16), b1 = parseInt(a.slice(5, 7), 16);
  const r2 = parseInt(b.slice(1, 3), 16), g2 = parseInt(b.slice(3, 5), 16), b2 = parseInt(b.slice(5, 7), 16);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2) < 80;
}

/**
 * Get business-type appropriate colors
 * If extracted colors are generic defaults, replace with business-type specific colors
 * Otherwise, keep the extracted colors from the website
 */
function getBusinessTypeColors(
  extractedColors: { primary: string; secondary: string },
  businessType: string
): { primary: string; secondary: string } {
  // Define business-type appropriate color palettes
  const businessTypeColors: Record<string, { primary: string; secondary: string }> = {
    restaurant: { primary: '#f97316', secondary: '#fb923c' }, // Orange/amber - appetite, warmth
    ecommerce: { primary: '#6366f1', secondary: '#818cf8' }, // Indigo - trust, professional
    healthcare: { primary: '#0ea5e9', secondary: '#38bdf8' }, // Sky blue - calm, trust
    fitness: { primary: '#10b981', secondary: '#22c55e' }, // Green - energy, health
    beauty: { primary: '#ec4899', secondary: '#f472b6' }, // Pink - elegance, femininity
    realestate: { primary: '#3b82f6', secondary: '#60a5fa' }, // Blue - trust, stability
    education: { primary: '#8b5cf6', secondary: '#a78bfa' }, // Purple - knowledge, creativity
    agency: { primary: '#8b5cf6', secondary: '#a78bfa' }, // Purple - creative, modern
    startup: { primary: '#6366f1', secondary: '#818cf8' }, // Indigo - innovation
    portfolio: { primary: '#6366f1', secondary: '#818cf8' }, // Indigo - professional
    service: { primary: '#3b82f6', secondary: '#60a5fa' }, // Blue - trust
    other: { primary: '#3b82f6', secondary: '#60a5fa' }, // Blue - neutral
  };

  // Check if extracted colors are the generic defaults (blue/purple)
  const isGenericDefault = (
    (extractedColors.primary === '#3b82f6' || extractedColors.primary === '#6366f1') &&
    (extractedColors.secondary === '#8b5cf6' || extractedColors.secondary === '#60a5fa')
  );

  // If colors are generic defaults, use business-type specific colors
  // Otherwise, keep the extracted colors (website has intentional branding)
  if (isGenericDefault) {
    const typeColors = businessTypeColors[businessType] || businessTypeColors.other;
    console.log(`[getBusinessTypeColors] Using business-type colors for ${businessType}:`, typeColors);
    return typeColors;
  }

  console.log(`[getBusinessTypeColors] Keeping extracted colors (not generic):`, extractedColors);
  return extractedColors;
}

// ==================== BUSINESS TYPE DETECTION ====================

// ==================== PRODUCTION-LEVEL MULTI-LAYER CLASSIFICATION SYSTEM ====================

/**
 * ARCHITECTURE OVERVIEW:
 * 
 * Layer 1: High-Confidence Signals (Schema.org, Platform Detection, Navigation Analysis)
 * Layer 2: Intent-Based Classification (Booking widgets, checkout flows, etc.)
 * Layer 3: Keyword Scoring (Existing regex-based scoring)
 * Layer 4: Veto Rules (Prevent misclassification from overlapping keywords)
 * Layer 5: Ambiguity Detection (Flag uncertain classifications)
 * Layer 6: Multi-Stage Pipeline (Family → Specific type)
 */

// ==================== TYPE DEFINITIONS ====================

type Signal = {
  re: RegExp;
  weight: number;          // higher = stronger signal
  scope?: "text" | "url" | "html";  // where to apply it
};

type CategoryModel = {
  type: BusinessType;
  signals: Signal[];
  negatives?: Signal[];    // subtract points / disqualify
  minScore: number;        // threshold to classify
};

type ClassificationResult = {
  type: BusinessType;
  confidence: 'high' | 'medium' | 'low' | 'ambiguous';
  score: number;
  secondRunner?: { type: BusinessType; score: number };
  reasons: string[];
  layer: 'schema' | 'platform' | 'navigation' | 'intent' | 'keyword' | 'fallback';
};

type NavigationSignals = {
  links: string[];
  hasMenu: boolean;
  hasBooking: boolean;
  hasCart: boolean;
  hasLogin: boolean;
  hasPricing: boolean;
};

type PlatformDetection = {
  type: BusinessType | null;
  platform: string | null;
  confidence: number;
};

const RX = {
  // safer "word boundary" for Unicode-ish text (handles punctuation around words)
  w: (s: string) => new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:${s})(?=$|[^\\p{L}\\p{N}])`, "giu"),
  any: (s: string) => new RegExp(s, "giu"),
};

// Very high-confidence schema.org type detection (JSON-LD)
const schemaTypeSignals: Record<BusinessType, RegExp[]> = {
  restaurant: [
    /"@type"\s*:\s*"Restaurant"/i,
    /"@type"\s*:\s*"FoodEstablishment"/i,
    /"servesCuisine"\s*:/i,
    /"menu"\s*:\s*"/i,
  ],
  healthcare: [
    /"@type"\s*:\s*"MedicalClinic"/i,
    /"@type"\s*:\s*"Hospital"/i,
    /"@type"\s*:\s*"Physician"/i,
    /"@type"\s*:\s*"Dentist"/i,
  ],
  beauty: [
    /"@type"\s*:\s*"BeautySalon"/i,
    /"@type"\s*:\s*"HairSalon"/i,
    /"@type"\s*:\s*"NailSalon"/i,
    /"@type"\s*:\s*"DaySpa"/i,
  ],
  fitness: [
    /"@type"\s*:\s*"HealthClub"/i,
    /"@type"\s*:\s*"SportsActivityLocation"/i,
    /"@type"\s*:\s*"ExerciseGym"/i,
  ],
  ecommerce: [
    /"@type"\s*:\s*"Product"/i,
    /"@type"\s*:\s*"Offer"/i,
    /"priceCurrency"\s*:/i,
    /"availability"\s*:/i,
  ],
  agency: [
    /"@type"\s*:\s*"ProfessionalService"/i,
    /"@type"\s*:\s*"Organization"/i,
  ],
  realestate: [
    /"@type"\s*:\s*"RealEstateAgent"/i,
    /"@type"\s*:\s*"Residence"/i,
    /"@type"\s*:\s*"ApartmentComplex"/i,
  ],
  education: [
    /"@type"\s*:\s*"EducationalOrganization"/i,
    /"@type"\s*:\s*"School"/i,
    /"@type"\s*:\s*"CollegeOrUniversity"/i,
    /"@type"\s*:\s*"Course"/i,
  ],
  portfolio: [
    /"@type"\s*:\s*"Person"/i,
  ],
  startup: [
    /"@type"\s*:\s*"SoftwareApplication"/i,
    /"@type"\s*:\s*"WebApplication"/i,
  ],
  service: [
    /"@type"\s*:\s*"LocalBusiness"/i,
    /"@type"\s*:\s*"Service"/i,
  ],
  other: [],
};

// ==================== LAYER 1: PLATFORM / BOOKING WIDGET DETECTION ====================
// These are VERY STRONG signals - if detected, they override most keyword scoring

const PLATFORM_FINGERPRINTS: Record<string, { type: BusinessType; confidence: number }> = {
  // Restaurant platforms
  'opentable': { type: 'restaurant', confidence: 95 },
  'resy.com': { type: 'restaurant', confidence: 95 },
  'toasttab': { type: 'restaurant', confidence: 90 },
  'doordash': { type: 'restaurant', confidence: 85 },
  'ubereats': { type: 'restaurant', confidence: 85 },
  'grubhub': { type: 'restaurant', confidence: 85 },
  'seamless': { type: 'restaurant', confidence: 85 },
  'eat24': { type: 'restaurant', confidence: 85 },
  'postmates': { type: 'restaurant', confidence: 80 },
  
  // Beauty/salon platforms
  'fresha.com': { type: 'beauty', confidence: 95 },
  'booksy.com': { type: 'beauty', confidence: 95 },
  'vagaro.com': { type: 'beauty', confidence: 95 },
  'styleseat': { type: 'beauty', confidence: 95 },
  'schedulicity': { type: 'beauty', confidence: 90 },
  'booker.com': { type: 'beauty', confidence: 90 },
  'zenoti': { type: 'beauty', confidence: 90 },
  
  // Fitness platforms
  'mindbodyonline': { type: 'fitness', confidence: 95 },
  'zenplanner': { type: 'fitness', confidence: 95 },
  'gymmaster': { type: 'fitness', confidence: 95 },
  'wodify': { type: 'fitness', confidence: 90 },
  'trainerize': { type: 'fitness', confidence: 90 },
  'perfectgym': { type: 'fitness', confidence: 90 },
  
  // E-commerce platforms
  'shopify': { type: 'ecommerce', confidence: 90 },
  'myshopify.com': { type: 'ecommerce', confidence: 95 },
  'woocommerce': { type: 'ecommerce', confidence: 90 },
  'magento': { type: 'ecommerce', confidence: 90 },
  'bigcommerce': { type: 'ecommerce', confidence: 90 },
  'squarespace/commerce': { type: 'ecommerce', confidence: 85 },
  'wix.com/ecommerce': { type: 'ecommerce', confidence: 85 },
  'ecwid': { type: 'ecommerce', confidence: 90 },
  'shoplazza': { type: 'ecommerce', confidence: 90 },
  
  // Healthcare platforms
  'zocdoc': { type: 'healthcare', confidence: 90 },
  'practicefusion': { type: 'healthcare', confidence: 90 },
  'athenahealth': { type: 'healthcare', confidence: 90 },
  'kareo': { type: 'healthcare', confidence: 85 },
  
  // Startup/SaaS specific
  'stripe.com': { type: 'startup', confidence: 70 },
  'auth0': { type: 'startup', confidence: 65 },
  'intercom': { type: 'startup', confidence: 60 },
};

// ==================== LAYER 2: NAVIGATION ANALYSIS ====================
// Navigation menu links are high-priority signals

const NAVIGATION_PATTERNS: Record<BusinessType, RegExp[]> = {
  restaurant: [
    /\b(menu|menus|food-menu|drinks|wine-list|order-online|delivery|takeout|reservations?|book-table)\b/i,
  ],
  beauty: [
    /\b(services|treatments|stylists|hair|nails|spa|facials?|massage|waxing|book-appointment|pricing)\b/i,
  ],
  fitness: [
    /\b(classes?|schedule|membership|join-now|personal-training|trainers?|programs?|workouts?|sign-up)\b/i,
  ],
  healthcare: [
    /\b(doctors?|physicians?|departments?|specialties|patient-portal|appointments?|services|insurance|billing)\b/i,
  ],
  ecommerce: [
    /\b(shop|store|products?|collections?|cart|checkout|account|my-account|orders?)\b/i,
  ],
  startup: [
    /\b(pricing|features|login|signup|sign-up|dashboard|docs|documentation|api|integrations?)\b/i,
  ],
  education: [
    /\b(courses?|programs?|enroll|admissions?|students?|faculty|campus|academics|apply)\b/i,
  ],
  realestate: [
    /\b(properties|listings?|search|buy|sell|rent|agents?|neighborhoods?|mortgage)\b/i,
  ],
  agency: [
    /\b(services|portfolio|work|projects?|case-studies|clients?|expertise|solutions)\b/i,
  ],
  portfolio: [
    /\b(about|work|projects?|portfolio|contact|resume|hire-me)\b/i,
  ],
  service: [
    /\b(services|quote|estimate|contact|areas?|about|testimonials?)\b/i,
  ],
  other: [],
};

// ==================== LAYER 3: INTENT DETECTION ====================
// Intent patterns that should override generic keyword collisions

const INTENT_PATTERNS: Record<BusinessType, { patterns: RegExp[]; weight: number }> = {
  restaurant: {
    patterns: [
      /\b(order (food|online|takeout|delivery)|reserve (a )?table|view (our )?menu|book (a )?reservation)\b/i,
      /\b(dine(-| )in|take(-| )out|curbside pickup|food delivery)\b/i,
    ],
    weight: 15,
  },
  beauty: {
    patterns: [
      /\b(book (an? )?(appointment|service)|schedule (a |an )?(haircut|facial|manicure|treatment))\b/i,
      /\b(salon (services|treatments)|spa (services|treatments)|hair (styling|coloring|treatment))\b/i,
    ],
    weight: 15,
  },
  fitness: {
    patterns: [
      /\b((join|start) (a |your )?membership|(book|schedule) (a )?class|personal training (session)?)\b/i,
      /\b(fitness (goals|journey|program)|workout (plan|schedule)|gym membership)\b/i,
    ],
    weight: 15,
  },
  healthcare: {
    patterns: [
      /\b(schedule (an? )?(appointment|visit)|patient (portal|registration)|medical (services|treatment))\b/i,
      /\b(healthcare (services|provider)|clinical (services|care)|diagnosis|treatment plan)\b/i,
    ],
    weight: 15,
  },
  ecommerce: {
    patterns: [
      /\b(add to (cart|bag)|checkout|shop (now|online)|buy (now|online)|place (an )?order)\b/i,
      /\b(free shipping|in stock|out of stock|track (your )?order|return policy)\b/i,
    ],
    weight: 12,
  },
  startup: {
    patterns: [
      /\b((start|begin) (your )?(free )?trial|sign up free|create (an )?account|get started (free)?)\b/i,
      /\b(api (access|integration)|developer (docs|api)|webhook|enterprise (plan|solution))\b/i,
    ],
    weight: 12,
  },
  education: {
    patterns: [
      /\b(enroll (now|today)|apply (now|online)|register for (class|course)|admission (process|requirements))\b/i,
      /\b(course (catalog|offerings)|degree (program)?|student (portal|services))\b/i,
    ],
    weight: 12,
  },
  realestate: {
    patterns: [
      /\b(search (properties|homes|listings)|schedule (a )?(showing|tour|viewing)|property (search|listings))\b/i,
      /\b((buy|sell|rent) (a )?(home|property)|real estate (agent|services))\b/i,
    ],
    weight: 12,
  },
  agency: {
    patterns: [
      /\b(request (a )?(quote|proposal)|start (a )?project|get (a )?(free )?consultation)\b/i,
      /\b((our|creative|digital) (services|solutions|expertise)|case (study|studies))\b/i,
    ],
    weight: 10,
  },
  portfolio: {
    patterns: [
      /\b(hire me|available for work|let'?s work together|view (my )?(work|portfolio))\b/i,
    ],
    weight: 10,
  },
  service: {
    patterns: [
      /\b(get (a )?(free )?(quote|estimate)|request (a )?(quote|estimate|service)|schedule (a )?service)\b/i,
    ],
    weight: 10,
  },
  other: {
    patterns: [],
    weight: 0,
  },
};

const CLASSIFICATION_MODELS: CategoryModel[] = [
  {
    type: "ecommerce",
    minScore: 10,
    signals: [
      // Checkout intent (very strong)
      { re: RX.any("\\b(add to cart|checkout|secure checkout|buy now|add to bag|cart subtotal|view cart|my cart)\\b"), weight: 8 },
      { re: RX.any("\\b(shop now|limited stock|in stock|out of stock|size guide|size chart|returns?|refund policy)\\b"), weight: 5 },
      { re: RX.any("\\b(product(s)?|variant|sku\\b|shipping\\b|free shipping\\b|track order\\b|order status|add to wishlist)\\b"), weight: 4 },
      // Fashion/retail specific
      { re: RX.any("\\b(collection|new arrival|sale|discount|coupon|promo code|limited edition|best seller|trending now)\\b"), weight: 3 },
      // URL signals
      { re: /\/(cart|checkout|collections|products|product|shop)\b/i, weight: 6, scope: "url" },
      { re: /\b(shopify|woocommerce|magento|bigcommerce)\b/i, weight: 7 },
    ],
    negatives: [
      // SaaS pricing pages can look like commerce
      { re: RX.any("\\b(api|developer docs|documentation|integrations|sdk|status page)\\b"), weight: 3 },
    ],
  },

  {
    type: "restaurant",
    minScore: 12,
    signals: [
      { re: RX.any("\\b(menu|our menu|drinks menu|lunch menu|dinner menu|breakfast menu|tasting menu|chef'?s special|food menu|wine list|view menu)\\b"), weight: 8 },
      { re: RX.any("\\b(book a table|reservation(s)?|opentable|resy|table for \\d+|reserve now|make reservation)\\b"), weight: 8 },
      { re: RX.any("\\b(takeout|take-away|delivery|order online|pickup|ubereats|doordash|foodpanda|deliveroo|grubhub|order now)\\b"), weight: 7 },
      { re: RX.any("\\b(restaurant|bistro|cafe|cafeteria|dining|cuisine|culinary|gastronomic|eatery)\\b"), weight: 5 },
      { re: RX.any("\\b(starters?|appetizers?|entrees?|mains?|desserts?|sides?|courses?|prix fixe)\\b"), weight: 4 },
      { re: RX.any("\\b(dine-in|dine in|eat in|fast food|quick service|table service)\\b"), weight: 4 },
      { re: /\/(menu|reservations?|order|delivery|dine|locations)\b/i, weight: 6, scope: "url" },
    ],
    negatives: [
      { re: RX.any("\\b(restaurant management|restaurant software|pos system|inventory management)\\b"), weight: 5 },
    ],
  },

  {
    type: "healthcare",
    minScore: 10,
    signals: [
      { re: RX.any("\\b(book (an )?appointment|make an appointment|patient portal|telemedicine|telehealth|video consult)\\b"), weight: 7 },
      { re: RX.any("\\b(doctor|physician|clinic|hospital|diagnosis|treatment|symptoms?|prescription|pharmacy|medical)\\b"), weight: 5 },
      { re: RX.any("\\b(pediatrics?|cardiology|dermatology|gynecology|obstetrics|orthopedics?|neurology|urology|psychiatry|oncology)\\b"), weight: 6 },
      { re: RX.any("\\b(insurance|billing|copay|referral|lab results?|radiology|ultrasound|x-?ray|mri|ct scan|blood test)\\b"), weight: 4 },
      { re: RX.any("\\b(dental|dentist|orthodontist|endodontist|root canal|crown|filling|teeth whitening)\\b"), weight: 5 },
      { re: /\/(appointment|patients?|services|departments?|doctors?)\b/i, weight: 4, scope: "url" },
    ],
    negatives: [
      { re: RX.any("\\b(health tips blog|wellness blog only|supplements store)\\b"), weight: 3 },
    ],
  },

  {
    type: "beauty",
    minScore: 15, // Increased from 9 to require stronger signals
    signals: [
      // Fragrance / perfume commerce (HIGHEST PRIORITY - very strong signals)
      // These businesses are ALWAYS beauty, even if they have strong ecommerce signals
      { re: RX.any("\\b(perfume|parfum|fragrance(s)?|cologne|eau de parfum|eau de toilette|edp|edt|attar|oud|decant(s)?)\\b"), weight: 12 },
      { re: RX.any("\\b(notes?\\s*:\\s*(top|middle|base)|sillage|projection|longevity|batch code|fragrance notes|scent notes)\\b"), weight: 10 },
      
      // Salon/spa services (strong)
      { re: RX.any("\\b(hair salon|beauty salon|nail salon|spa service|haircut|blowout|balayage|highlights?|hair color|keratin|hair treatment|styling)\\b"), weight: 7 },
      { re: RX.any("\\b(manicure|pedicure|nail art|gel nails|acrylic nails|lash extension|brow(s)? service|waxing service|threading|eyebrow service)\\b"), weight: 7 },
      { re: RX.any("\\b(spa|facial(s)?|hydrafacial|massage therapy|body scrub|body wrap|body treatment)\\b"), weight: 6 },
      
      // Cosmetics & skincare
      { re: RX.any("\\b(cosmetic(s)?|makeup|lipstick|foundation|concealer|eyeshadow|mascara|blush|primer)\\b"), weight: 5 },
      { re: RX.any("\\b(skincare|serum|moisturizer|cleanser|toner|exfoliant|anti-aging|sunscreen|spf)\\b"), weight: 4 },
      
      { re: /\/(salon|spa|fragrance|perfume|beauty|cosmetics|parfum)\b/i, weight: 6, scope: "url" },
    ],
    negatives: [
      { re: RX.any("\\b(beauty of|beautiful|beauty is)\\b"), weight: 2 }, // "beauty" as generic word
      { re: RX.any("\\b(beauty salon software|salon management software)\\b"), weight: 6 },
      // Don't confuse fragrance products with fitness "workout" collections
      { re: RX.any("\\b(gym membership|fitness class|personal trainer)\\b"), weight: 3 },
    ],
  },

  {
    type: "fitness",
    minScore: 9,
    signals: [
      { re: RX.any("\\b(gym|fitness (center|club)|health club|gym membership|day pass|multipass)\\b"), weight: 7 },
      { re: RX.any("\\b(personal training|personal trainer|strength training|weight training|free weights|functional training|pt session)\\b"), weight: 6 },
      { re: RX.any("\\b(class schedule|timetable|hiit|spin class|zumba|pilates class|yoga (studio|class)|crossfit|bootcamp)\\b"), weight: 6 },
      { re: RX.any("\\b(trainer(s)?|training plan|body composition|inbody|macro coaching|nutrition coaching|fitness assessment)\\b"), weight: 4 },
      { re: RX.any("\\b(cardio|treadmill|elliptical|rowing machine|exercise equipment|weight room|locker room|sauna)\\b"), weight: 3 },
      { re: /\/(classes|schedule|membership|trainers?|gym)\b/i, weight: 5, scope: "url" },
    ],
    negatives: [
      // avoid "workout app / workout program" SaaS pages
      { re: RX.any("\\b(api|dashboard|platform|saas|integrations|docs|developer)\\b"), weight: 4 },
      // Don't confuse with perfume collections named "workout"
      { re: RX.any("\\b(perfume|parfum|fragrance|eau de|cologne|scent)\\b"), weight: 5 },
    ],
  },

  {
    type: "realestate",
    minScore: 9,
    signals: [
      { re: RX.any("\\b(listing(s)?|for sale|for rent|open house|property details|mls\\b|sq\\.?\\s*ft|square feet|price per sq)\\b"), weight: 6 },
      { re: RX.any("\\b(realtor|real estate agent|brokerage|broker|mortgage|down payment|escrow|closing costs|title)\\b"), weight: 5 },
      { re: RX.any("\\b(apartment(s)?|condo|villa(s)?|plot(s)?|townhouse|bed(room)?s?|bath(room)?s?|bhk)\\b"), weight: 4 },
      { re: RX.any("\\b(property|properties|residential|commercial|land|lease|tenant|landlord)\\b"), weight: 3 },
      { re: /\/(listings?|properties|rent|buy|sell|realestate)\b/i, weight: 5, scope: "url" },
    ],
    negatives: [
      { re: RX.any("\\b(real estate software|crm for realtors|property management software)\\b"), weight: 6 },
    ],
  },

  {
    type: "education",
    minScore: 8,
    signals: [
      { re: RX.any("\\b(course(s)?|curriculum|syllabus|enroll|admissions?|tuition|scholarship(s)?|apply now)\\b"), weight: 6 },
      { re: RX.any("\\b(academy|school|college|university|institute|campus|student(s)?|faculty|professor)\\b"), weight: 5 },
      { re: RX.any("\\b(certification|certificate|diploma|degree|semester|lecture(s)?|training program|online learning)\\b"), weight: 4 },
      { re: RX.any("\\b(e-learning|lms|learning management|virtual classroom|study material)\\b"), weight: 4 },
      { re: /\/(courses?|admissions?|apply|programs?|learning)\b/i, weight: 4, scope: "url" },
    ],
  },

  {
    type: "agency",
    minScore: 8,
    signals: [
      { re: RX.any("\\b(creative agency|marketing agency|digital agency|advertising agency|branding|brand strategy)\\b"), weight: 7 },
      { re: RX.any("\\b(seo|ppc|google ads|meta ads|content strategy|social media management|smm|influencer marketing)\\b"), weight: 5 },
      { re: RX.any("\\b(web design|ui/ux|graphic design|copywriting|campaign(s)?|creative services)\\b"), weight: 4 },
      { re: RX.any("\\b(case studies?|our work|our clients?|portfolio|client testimonials|success stories)\\b"), weight: 3 },
      { re: /\/(services|work|portfolio|clients|case-studies)\b/i, weight: 3, scope: "url" },
    ],
    negatives: [
      { re: RX.any("\\b(hiring|careers|job openings)\\b"), weight: 1 },
    ],
  },

  {
    type: "startup",
    minScore: 8,
    signals: [
      { re: RX.any("\\b(sign up|log in|login|dashboard|free trial|pricing|subscription|billing|get started)\\b"), weight: 6 },
      { re: RX.any("\\b(api|documentation|integrations|sdk|webhooks|status page|developer portal)\\b"), weight: 6 },
      { re: RX.any("\\b(saas|platform|cloud-based|enterprise|teams?|workspace|automation)\\b"), weight: 5 },
      { re: RX.any("\\b(features|plans|upgrade|premium|pro plan|business plan)\\b"), weight: 3 },
      { re: /\/(pricing|docs|login|signup|register|dashboard)\b/i, weight: 4, scope: "url" },
    ],
    negatives: [
      // ecommerce checkout pages can resemble SaaS pricing
      { re: RX.any("\\b(add to cart|shipping|returns?)\\b"), weight: 4 },
    ],
  },

  {
    type: "portfolio",
    minScore: 7,
    signals: [
      { re: RX.any("\\b(about me|my work|my projects?|case studies?|dribbble|behance|github|resume|cv)\\b"), weight: 6 },
      { re: RX.any("\\b(freelance|available for work|hire me|contact me|let'?s work together)\\b"), weight: 5 },
      { re: RX.any("\\b(ux designer|product designer|full-stack developer|photographer|videographer|illustrator)\\b"), weight: 4 },
      { re: /\/(about|work|projects?|contact)\b/i, weight: 3, scope: "url" },
    ],
    negatives: [
      { re: RX.any("\\b(our team|enterprise|pricing|checkout)\\b"), weight: 3 },
    ],
  },

  {
    type: "service",
    minScore: 6,
    signals: [
      // Generic service business terms (plumbing, landscaping, cleaning, etc.)
      { re: RX.any("\\b(plumbing|plumber|electrician|electrical service|hvac|air conditioning|heating)\\b"), weight: 6 },
      { re: RX.any("\\b(landscaping|lawn care|gardening|tree service|irrigation|lawn mowing)\\b"), weight: 6 },
      { re: RX.any("\\b(cleaning service|housekeeping|maid service|janitorial|carpet cleaning)\\b"), weight: 6 },
      { re: RX.any("\\b(roofing|siding|gutter|painting service|home improvement|handyman)\\b"), weight: 5 },
      { re: RX.any("\\b(pest control|extermin|moving service|junk removal|hauling)\\b"), weight: 5 },
      { re: RX.any("\\b(auto repair|car repair|mechanic|body shop|detailing)\\b"), weight: 5 },
      { re: RX.any("\\b(free quote|free estimate|get a quote|request quote|call us|service area)\\b"), weight: 4 },
      { re: RX.any("\\b(licensed|insured|certified|bonded|professional service)\\b"), weight: 3 },
      { re: /\/(services?|quote|estimate|areas?-served)\b/i, weight: 3, scope: "url" },
    ],
  },

  {
    type: "other",
    minScore: 0, // catch-all, always qualifies
    signals: [],
  },
];

function normalize(input: string): string {
  // normalize unicode, lowercase, collapse whitespace
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

type ClassifyInput = {
  text: string;      // visible text + meta + headings combined
  url?: string;      // page url
  html?: string;     // full HTML for platform detection
  jsonLd?: string;   // extracted JSON-LD blocks concatenated
  productCount?: number; // number of products found
  navigationLinks?: string[]; // extracted navigation hrefs
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Layer 1A: Detect platforms from HTML (scripts, iframes, etc.)
 */
function detectPlatform(html: string): PlatformDetection {
  const H = html.toLowerCase();
  
  for (const [fingerprint, config] of Object.entries(PLATFORM_FINGERPRINTS)) {
    if (H.includes(fingerprint.toLowerCase())) {
      console.log(`[detectPlatform] Found platform: ${fingerprint} → ${config.type} (confidence: ${config.confidence}%)`);
      return {
        type: config.type,
        platform: fingerprint,
        confidence: config.confidence,
      };
    }
  }
  
  return { type: null, platform: null, confidence: 0 };
}

/**
 * Layer 1B: Analyze navigation links
 */
function analyzeNavigation(links: string[]): NavigationSignals {
  const linkText = links.join(' ').toLowerCase();
  
  return {
    links: links.map(l => l.toLowerCase()),
    hasMenu: /\b(menu|food|drinks)\b/.test(linkText),
    hasBooking: /\b(book|reservation|appointment|schedule)\b/.test(linkText),
    hasCart: /\b(cart|shop|store|checkout)\b/.test(linkText),
    hasLogin: /\b(login|signin|sign-in|dashboard|account)\b/.test(linkText),
    hasPricing: /\b(pricing|plans|subscribe|membership)\b/.test(linkText),
  };
}

/**
 * Layer 1C: Get navigation-based type scores
 */
function getNavigationScores(links: string[]): Partial<Record<BusinessType, number>> {
  const scores: Partial<Record<BusinessType, number>> = {};
  const linkText = links.join(' ');
  
  for (const [type, patterns] of Object.entries(NAVIGATION_PATTERNS) as [BusinessType, RegExp[]][]) {
    let score = 0;
    for (const pattern of patterns) {
      const matches = linkText.match(pattern);
      if (matches) {
        score += matches.length * 8; // High weight for navigation matches
      }
    }
    if (score > 0) {
      scores[type] = score;
    }
  }
  
  return scores;
}

/**
 * Layer 2: Detect intent patterns
 */
function detectIntent(text: string): Partial<Record<BusinessType, number>> {
  const scores: Partial<Record<BusinessType, number>> = {};
  
  for (const [type, config] of Object.entries(INTENT_PATTERNS) as [BusinessType, { patterns: RegExp[]; weight: number }][]) {
    let matches = 0;
    for (const pattern of config.patterns) {
      if (pattern.test(text)) {
        matches++;
      }
    }
    if (matches > 0) {
      scores[type] = matches * config.weight;
    }
  }
  
  return scores;
}

/**
 * Layer 4: Veto rules to prevent misclassification
 * Returns null if classification should proceed, or a BusinessType if veto is triggered
 */
function applyVetoRules(
  scores: Record<BusinessType, number>,
  intent: Partial<Record<BusinessType, number>>,
  platform: PlatformDetection,
  navSignals: NavigationSignals
): { vetoed: boolean; type?: BusinessType; reason?: string } {
  
  // VETO RULE 1: Restaurant intent + menu signals → prevent beauty/salon
  if (
    (intent['restaurant'] || 0) > 10 &&
    scores['restaurant'] >= 12 &&
    navSignals.hasMenu
  ) {
    if (scores['beauty'] > scores['restaurant'] && scores['beauty'] < scores['restaurant'] + 20) {
      console.log('[Veto] Restaurant intent detected, blocking beauty classification');
      return { vetoed: true, type: 'restaurant', reason: 'Restaurant intent with menu signals' };
    }
  }
  
  // VETO RULE 2: Beauty/salon booking widget detected → prevent restaurant
  if (
    platform.type === 'beauty' &&
    platform.confidence >= 90 &&
    scores['beauty'] >= 10
  ) {
    console.log('[Veto] Beauty platform detected, blocking non-beauty classification');
    return { vetoed: true, type: 'beauty', reason: 'Beauty booking platform detected' };
  }
  
  // VETO RULE 3: Ecommerce checkout signals → startup cannot win unless strong SaaS signals
  if (
    scores['ecommerce'] >= 15 &&
    navSignals.hasCart &&
    scores['startup'] > scores['ecommerce']
  ) {
    if ((intent['startup'] || 0) < 15) {
      console.log('[Veto] E-commerce checkout detected, blocking startup classification');
      return { vetoed: true, type: 'ecommerce', reason: 'E-commerce checkout signals' };
    }
  }
  
  // VETO RULE 4: Fitness platform detected → prevent beauty/healthcare
  if (
    platform.type === 'fitness' &&
    platform.confidence >= 90
  ) {
    console.log('[Veto] Fitness platform detected');
    return { vetoed: true, type: 'fitness', reason: 'Fitness booking platform detected' };
  }
  
  // VETO RULE 5: Healthcare appointment system → prevent beauty/fitness
  if (
    (intent['healthcare'] || 0) > 12 &&
    scores['healthcare'] >= 10 &&
    /(patient|doctor|physician|clinic|medical)/i.test(JSON.stringify(scores))
  ) {
    if (scores['beauty'] > scores['healthcare'] || scores['fitness'] > scores['healthcare']) {
      console.log('[Veto] Healthcare intent detected, blocking beauty/fitness');
      return { vetoed: true, type: 'healthcare', reason: 'Healthcare appointment system detected' };
    }
  }
  
  // VETO RULE 6: Perfume/fragrance business → prevent gym/fitness misclassification
  if (
    scores['beauty'] >= 24 &&
    scores['fitness'] > scores['beauty']
  ) {
    console.log('[Veto] Strong perfume/fragrance signals, blocking fitness');
    return { vetoed: true, type: 'beauty', reason: 'Perfume/fragrance business detected' };
  }
  
  return { vetoed: false };
}

/**
 * Extract navigation menu links from HTML for classification
 */
function extractNavigationMenuLinks(html: string): string[] {
  const links: string[] = [];
  
  // Extract from <nav> elements
  const navRegex = /<nav[^>]*>([\s\S]*?)<\/nav>/gi;
  const navMatches = html.matchAll(navRegex);
  
  for (const navMatch of navMatches) {
    const navHtml = navMatch[1];
    const anchorRegex = /<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/gi;
    const anchorMatches = navHtml.matchAll(anchorRegex);
    
    for (const anchorMatch of anchorMatches) {
      const href = anchorMatch[1];
      const text = anchorMatch[2];
      if (href && text) {
        links.push(`${href} ${text}`.trim());
      }
    }
  }
  
  // Extract from <header> elements if nav links not found
  if (links.length < 3) {
    const headerRegex = /<header[^>]*>([\s\S]*?)<\/header>/gi;
    const headerMatches = html.matchAll(headerRegex);
    
    for (const headerMatch of headerMatches) {
      const headerHtml = headerMatch[1];
      const anchorRegex = /<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/gi;
      const anchorMatches = headerHtml.matchAll(anchorRegex);
      
      for (const anchorMatch of anchorMatches) {
        const href = anchorMatch[1];
        const text = anchorMatch[2];
        if (href && text) {
          links.push(`${href} ${text}`.trim());
        }
      }
    }
  }
  
  console.log(`[extractNavigationMenuLinks] Found ${links.length} navigation links`);
  return links.slice(0, 20); // Limit to first 20 links
}

/**
 * PRODUCTION-LEVEL MULTI-LAYER CLASSIFICATION
 */
function classifyWebsite({
  text,
  url = "",
  html = "",
  jsonLd = "",
  productCount = 0,
  navigationLinks = []
}: ClassifyInput): ClassificationResult {
  
  const T = normalize(text);
  const U = normalize(url);
  const J = jsonLd; // keep as-is; regexes are case-insensitive
  const H = html;
  
  const reasons: string[] = [];
  
  // ==================== LAYER 1: HIGH-CONFIDENCE SIGNALS ====================
  
  // 1A: Schema.org detection (VERY HIGH CONFIDENCE)
  const schemaBoost: Partial<Record<BusinessType, number>> = {};
  let schemaDetected: BusinessType | null = null;
  let schemaConfidence = 0;
  
  for (const [type, res] of Object.entries(schemaTypeSignals) as [BusinessType, RegExp[]][]) {
    for (const re of res) {
      if (re.test(J)) {
        const boost = 12;
        schemaBoost[type] = (schemaBoost[type] ?? 0) + boost;
        if ((schemaBoost[type] ?? 0) > schemaConfidence) {
          schemaDetected = type;
          schemaConfidence = schemaBoost[type] ?? 0;
        }
      }
    }
  }
  
  // If schema detected with multiple matches, high confidence
  if (schemaDetected && schemaConfidence >= 24) {
    reasons.push(`Schema.org ${schemaDetected} detected (confidence: ${schemaConfidence})`);
    console.log(`[Layer 1A - Schema] Strong match: ${schemaDetected} (score: ${schemaConfidence})`);
    return {
      type: schemaDetected,
      confidence: 'high',
      score: schemaConfidence,
      reasons,
      layer: 'schema',
    };
  }
  
  // 1B: Platform detection (with smart restaurant override)
  const platform = detectPlatform(H);
  if (platform.type && platform.confidence >= 85) {
    // SPECIAL CASE: Restaurant using ecommerce platforms (food delivery)
    if (platform.type === 'ecommerce') {
      // Check for strong restaurant indicators
      const hasRestaurantKeywords = /\b(menu|food|restaurant|cafe|dining|delivery|takeout|chef|cuisine|dishes?|meals?|eat|dine)\b/i.test(T);
      const hasMenuPage = navigationLinks.some(link => /menu|food/i.test(link));
      const hasRestaurantSchema = /"@type"\s*:\s*"(Restaurant|FoodEstablishment)"/i.test(J);
      
      if ((hasRestaurantKeywords && hasMenuPage) || hasRestaurantSchema) {
        reasons.push(`Platform detected: ${platform.platform} (but overridden by restaurant signals)`);
        console.log(`[Layer 1B - Platform Override] ${platform.platform} detected but has restaurant signals, classifying as restaurant`);
        // Continue to full classification instead of returning immediately
      } else {
        reasons.push(`Platform detected: ${platform.platform} → ${platform.type}`);
        console.log(`[Layer 1B - Platform] ${platform.platform} → ${platform.type} (confidence: ${platform.confidence}%)`);
        return {
          type: platform.type,
          confidence: 'high',
          score: platform.confidence,
          reasons,
          layer: 'platform',
        };
      }
    } else {
      // Non-ecommerce platforms still get immediate return
      reasons.push(`Platform detected: ${platform.platform} → ${platform.type}`);
      console.log(`[Layer 1B - Platform] ${platform.platform} → ${platform.type} (confidence: ${platform.confidence}%)`);
      return {
        type: platform.type,
        confidence: 'high',
        score: platform.confidence,
        reasons,
        layer: 'platform',
      };
    }
  }
  
  // 1C: Navigation analysis
  const navScores = navigationLinks.length > 0 ? getNavigationScores(navigationLinks) : {};
  const navSignals = navigationLinks.length > 0 ? analyzeNavigation(navigationLinks) : {
    links: [],
    hasMenu: false,
    hasBooking: false,
    hasCart: false,
    hasLogin: false,
    hasPricing: false,
  };
  
  Object.entries(navScores).forEach(([type, score]) => {
    if (score >= 16) {
      reasons.push(`Strong navigation signals for ${type} (score: ${score})`);
    }
  });
  
  // ==================== LAYER 2: INTENT DETECTION ====================
  
  const intentScores = detectIntent(T);
  Object.entries(intentScores).forEach(([type, score]) => {
    if (score >= 15) {
      reasons.push(`Strong intent detected for ${type} (score: ${score})`);
    }
  });
  
  // ==================== LAYER 3: KEYWORD SCORING (EXISTING LOGIC) ====================
  
  const scores: Record<BusinessType, number> = Object.fromEntries(
    CLASSIFICATION_MODELS.map(m => [m.type, 0])
  ) as any;

  for (const model of CLASSIFICATION_MODELS) {
    let score = (schemaBoost[model.type] ?? 0) + (navScores[model.type] ?? 0) + (intentScores[model.type] ?? 0);

    for (const s of model.signals) {
      const hay = s.scope === "url" ? U : s.scope === "html" ? H : T;
      if (!hay) continue;

      // count matches (cap to avoid spammy keyword stuffing inflating score)
      const matches = hay.match(s.re);
      if (matches?.length) score += Math.min(matches.length, 3) * s.weight;
    }

    if (model.negatives?.length) {
      for (const n of model.negatives) {
        const hay = n.scope === "url" ? U : n.scope === "html" ? H : T;
        const matches = hay.match(n.re);
        if (matches?.length) score -= Math.min(matches.length, 3) * n.weight;
      }
    }

    scores[model.type] = score;
  }

  // Product count boost for ecommerce (but only if not a specialized beauty/perfume store)
  if (productCount >= 3 && scores['beauty'] < 20) {
    scores['ecommerce'] += productCount * 2;
    if (productCount >= 3) {
      reasons.push(`Product count boost: ${productCount} products`);
    }
  }
  
  // Restaurant boost when using ecommerce platforms for food delivery
  if (platform.type === 'ecommerce' && platform.confidence >= 85) {
    const hasRestaurantKeywords = /\b(menu|food|restaurant|cafe|dining|delivery|takeout|chef|cuisine|dishes?|meals?|eat|dine|burger|pizza|chicken|fish|steak|dessert|breakfast|lunch|dinner)\b/i.test(T);
    const hasMenuPage = navigationLinks.some(link => /menu|food/i.test(link));
    const hasRestaurantNav = /\b(menu|food|order[-\s]online|delivery|takeout)\b/i.test(navigationLinks.join(' '));
    
    if (hasRestaurantKeywords || hasMenuPage || hasRestaurantNav) {
      const boost = 40; // Strong boost to overcome platform detection
      scores['restaurant'] = (scores['restaurant'] || 0) + boost;
      reasons.push(`Restaurant boost: Using ${platform.platform} for food ordering (boost: ${boost})`);
      console.log(`[Restaurant Boost] ${platform.platform} detected with restaurant signals, boosting restaurant score by ${boost}`);
    }
  }
  
  // ==================== LAYER 4: VETO RULES ====================
  
  const veto = applyVetoRules(scores, intentScores, platform, navSignals);
  if (veto.vetoed && veto.type) {
    reasons.push(`Veto applied: ${veto.reason}`);
    console.log(`[Layer 4 - Veto] ${veto.reason} → ${veto.type}`);
    return {
      type: veto.type,
      confidence: 'high',
      score: scores[veto.type] || 0,
      reasons,
      layer: 'intent',
    };
  }
  
  // ==================== LAYER 5: AMBIGUITY DETECTION ====================
  
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topType, topScore] = ranked[0] as [BusinessType, number];
  const [secondType, secondScore] = ranked[1] as [BusinessType, number];
  const model = CLASSIFICATION_MODELS.find(m => m.type === topType)!;

  console.log('[Layer 3 - Keyword] Scores:', Object.fromEntries(ranked.slice(0, 5)));
  console.log('[Layer 3 - Keyword] Product count:', productCount);
  console.log('[Layer 3 - Keyword] Top type:', topType, 'Score:', topScore);
  
  // Ambiguity check: if top two are too close
  if (topScore > 0 && secondScore > 0) {
    const margin = (topScore - secondScore) / topScore;
    if (margin < 0.2 && topScore >= model.minScore) {
      reasons.push(`Ambiguous: ${topType} (${topScore}) vs ${secondType} (${secondScore})`);
      console.log(`[Layer 5 - Ambiguity] Too close: ${topType} (${topScore}) vs ${secondType} (${secondScore})`);
      return {
        type: topType,
        confidence: 'ambiguous',
        score: topScore,
        secondRunner: { type: secondType, score: secondScore },
        reasons,
        layer: 'keyword',
      };
    }
  }
  
  // ==================== FINAL CLASSIFICATION ====================
  
  const confident = topScore >= model.minScore;
  
  if (confident) {
    reasons.push(`Keyword scoring: ${topType} won with score ${topScore}`);
  } else {
    reasons.push(`Low confidence (score ${topScore} < threshold ${model.minScore}), falling back to 'service'`);
  }

  return {
    type: confident ? topType : 'service',
    confidence: confident ? (topScore >= model.minScore * 2 ? 'high' : 'medium') : 'low',
    score: topScore,
    secondRunner: { type: secondType, score: secondScore },
    reasons,
    layer: 'keyword',
  };
}

function detectBusinessType(
  allText: string,
  productCount: number = 0,
  url: string = '',
  jsonLd: string = '',
  html: string = '',
  navigationLinks: string[] = []
): BusinessType {
  const result = classifyWebsite({
    text: allText,
    url,
    html,
    jsonLd,
    productCount,
    navigationLinks,
  });

  console.log('[detectBusinessType] Final result:', result.type, `(${result.confidence} confidence, layer: ${result.layer})`);
  console.log('[detectBusinessType] Reasons:', result.reasons);

  return result.type;
}

// ==================== MULTI-PAGE NAVIGATION DETECTION ====================

function extractNavigationLinks(html: string, baseUrl: string): { url: string; type: string }[] {
  const links: { url: string; type: string }[] = [];
  const seen = new Set<string>();
  const clean = cleanHtml(html);

  const anchorRegex = /<a\s+[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = anchorRegex.exec(clean)) !== null) {
    let href = m[1].trim();
    const text = stripTags(m[2]).toLowerCase();
    if (!text || text.length < 2 || text.length > 50) continue;

    // Skip unwanted pages
    if (/cart|checkout|login|signup|sign-in|account|admin|search|privacy|terms|cookie|sitemap|rss|feed/i.test(href + ' ' + text)) continue;
    if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;

    const resolved = resolveUrl(href, baseUrl);
    if (!resolved) continue;

    // Same domain only
    try {
      const linkHost = new URL(resolved).hostname;
      const baseHost = new URL(baseUrl).hostname;
      if (linkHost !== baseHost) continue;
    } catch { continue; }

    // Normalize
    try {
      const u = new URL(resolved);
      href = `${u.origin}${u.pathname}`;
    } catch { continue; }

    if (seen.has(href) || href === baseUrl || href === baseUrl + '/') continue;
    seen.add(href);

    // Classify page type
    const combined = (href + ' ' + text).toLowerCase();
    let type = 'other';
    if (/about|who[-\s]we[-\s]are|our[-\s]story|company/i.test(combined)) type = 'about';
    else if (/service|what[-\s]we[-\s]do|offering|solution/i.test(combined)) type = 'services';
    else if (/shop|store|products?|collections?|catalog|buy|merchandise/i.test(combined)) type = 'shop';
    else if (/menu|food|dishes|eat|dine/i.test(combined)) type = 'menu';
    else if (/pricing|price|plans|packages|rates/i.test(combined)) type = 'pricing';
    else if (/contact|get[-\s]in[-\s]touch|reach[-\s]us|location/i.test(combined)) type = 'contact';
    else if (/portfolio|projects|work|case[-\s]stud|gallery|photos/i.test(combined)) type = 'portfolio';
    else if (/testimonial|review|feedback|client|success/i.test(combined)) type = 'testimonials';
    else if (/team|staff|people|our[-\s]team/i.test(combined)) type = 'team';
    else if (/blog|news|article|insight/i.test(combined)) type = 'blog';

    if (type !== 'other') {
      links.push({ url: href, type });
    }
  }

  // Sort by priority
  const priority: Record<string, number> = {
    shop: 1, menu: 2, about: 3, services: 4, pricing: 5, contact: 6, portfolio: 7,
    testimonials: 8, team: 9, blog: 10, other: 11,
  };
  links.sort((a, b) => (priority[a.type] || 10) - (priority[b.type] || 10));
  return links.slice(0, 8); // Max 8 sub-pages
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const resp = await fetchWithRetry(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    if (!resp || !resp.ok) return null;
    return await resp.text();
  } catch {
    return null;
  }
}

// Extract JSON-LD structured data for high-confidence business type detection
function extractJsonLd(html: string): string {
  const jsonLdBlocks: string[] = [];
  const scriptMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  
  for (const match of scriptMatches) {
    try {
      const jsonStr = match[1].trim();
      // Validate it's parseable JSON, then keep it
      JSON.parse(jsonStr);
      jsonLdBlocks.push(jsonStr);
    } catch {
      // Skip invalid JSON
    }
  }
  
  return jsonLdBlocks.join('\n');
}

// ==================== MAIN SCRAPER ====================

export class EnhancedScraperService {
  /**
   * Scrape a website with multi-page crawling and comprehensive extraction.
   * Returns ScrapedDataExtended + rawText (for LLM context) + scrapedImages (typed).
   */
  async scrapeWebsite(url: string): Promise<EnhancedScrapedData> {
    console.log(`[EnhancedScraper] Starting multi-page scrape: ${url}`);
    const startTime = Date.now();

    try {
      const baseUrl = new URL(url).origin;

      // Step 1: Fetch homepage
      const homeHtml = await fetchPage(url);
      if (!homeHtml) throw new Error('Failed to fetch homepage');

      // Step 2: Extract navigation links for multi-page crawling
      const navTargets = extractNavigationLinks(homeHtml, baseUrl);
      console.log(`[EnhancedScraper] Found ${navTargets.length} sub-pages: ${navTargets.map(n => n.type).join(', ')}`);

      // Step 2.5: If no shop page found in nav, try common product page URLs
      const hasShopPage = navTargets.some(t => t.type === 'shop');
      if (!hasShopPage) {
        const commonProductPaths = ['/shop', '/products', '/store', '/collections', '/catalog', '/product-category', '/shop-now'];
        console.log('[EnhancedScraper] No shop page in nav, trying common product URLs...');
        for (const path of commonProductPaths) {
          try {
            const testUrl = `${baseUrl}${path}`;
            const testHtml = await fetchPage(testUrl);
            if (testHtml && testHtml.length > 1000) {
              // Check if it looks like a product page (has product-related content)
              if (/product|item|price|cart|buy/i.test(testHtml)) {
                console.log(`[EnhancedScraper] Found product page at ${testUrl}`);
                navTargets.unshift({ url: testUrl, type: 'shop' }); // Add to front of list
                break; // Only add one shop page
              }
            }
          } catch {
            continue;
          }
        }
      }

      // Step 3: Crawl sub-pages in parallel (batches of 3)
      const subPages: RawPageData[] = [];
      for (let i = 0; i < navTargets.length; i += 3) {
        const batch = navTargets.slice(i, i + 3);
        const results = await Promise.allSettled(
          batch.map(async (target) => {
            const html = await fetchPage(target.url);
            if (html) {
              subPages.push({ url: target.url, pageType: target.type, html });
            }
          })
        );
        // Small delay between batches to be respectful
        if (i + 3 < navTargets.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      console.log(`[EnhancedScraper] Crawled ${subPages.length} sub-pages`);

      // Step 4: Combine all HTML for comprehensive extraction
      const allHtml = [homeHtml, ...subPages.map(p => p.html)].join('\n<!-- PAGE_BREAK -->\n');

      // Step 5: Extract from homepage
      const homeText = extractText(homeHtml, baseUrl);

      // Step 6: Extract from all pages combined
      const allImages = extractAllImages(allHtml, baseUrl);
      const contact = extractContact(allHtml);
      const colors = extractColors(allHtml);

      // Step 7: Merge per-page content
      let allServices = [...homeText.services];
      let allFeatures = [...homeText.features];
      let allTestimonials = [...homeText.testimonials];
      let allProducts: Array<{
        name: string;
        description?: string;
        price?: number;
        salePrice?: number;
        image?: string;
        category?: string;
      }> = [];
      let aboutContent = homeText.aboutContent;
      const allParagraphs = [...homeText.paragraphs];
      const allHeadings = [...homeText.headings];
      const allPricingText = [...homeText.pricingText];
      const allFaqItems = [...homeText.faqItems];
      const allCtaButtons = [...homeText.ctaButtons];

      // Check if this is a Shopify store
      const isShopify = homeHtml.includes('Shopify') || homeHtml.includes('shopify') || 
                        homeHtml.includes('cdn.shopify.com') || homeHtml.includes('myshopify.com');
      
      // Check if this is a social media URL
      const isSocialMedia = /instagram\.com|facebook\.com|twitter\.com|linkedin\.com|tiktok\.com/i.test(url);
      
      // Detect likely business type from content
      const contentLower = (homeHtml + homeText.title + homeText.metaDescription).toLowerCase();
      const isLikelyRestaurant = /restaurant|menu|cuisine|dining|cafe|bistro|food/i.test(contentLower);
      const isLikelyService = /consulting|service|agency|studio|freelance|expert|professional/i.test(contentLower);
      
      console.log(`[EnhancedScraper] Site Analysis:`, {
        isShopify,
        isSocialMedia,
        isLikelyRestaurant,
        isLikelyService
      });

      // SMART EXTRACTION STRATEGY
      // 1. Try Shopify API for e-commerce stores
      if (isShopify) {
        console.log('[EnhancedScraper] Attempting Shopify API extraction...');
        const shopifyProducts = await extractShopifyProducts(baseUrl);
        if (shopifyProducts.length > 0) {
          console.log(`[EnhancedScraper] ✓ Extracted ${shopifyProducts.length} products via Shopify API`);
          allProducts.push(...shopifyProducts);
        }
      }
      
      // 2. Try menu extraction for restaurants (even if no products found)
      if (isLikelyRestaurant && allProducts.length < 10) {
        console.log('[EnhancedScraper] Restaurant detected, extracting menu items...');
        const menuItems = extractMenuItems(homeHtml, baseUrl);
        if (menuItems.length > 0) {
          console.log(`[EnhancedScraper] ✓ Extracted ${menuItems.length} menu items`);
          allProducts.push(...menuItems);
        }
        // Also check menu pages
        for (const page of subPages) {
          if (page.pageType === 'menu' || page.html.toLowerCase().includes('menu')) {
            const pageMenuItems = extractMenuItems(page.html, baseUrl);
            if (pageMenuItems.length > 0) {
              console.log(`[EnhancedScraper] ✓ Found ${pageMenuItems.length} items on menu page`);
              allProducts.push(...pageMenuItems);
            }
          }
        }
      }
      
      // 3. Extract from social media if applicable
      if (isSocialMedia) {
        console.log('[EnhancedScraper] Social media URL detected, extracting profile data...');
        const socialContent = extractSocialMediaContent(homeHtml, url);
        if (socialContent.bio) {
          aboutContent = socialContent.bio;
        }
        if (socialContent.highlights.length > 0) {
          allFeatures.push(...socialContent.highlights);
        }
      }
      
      // 4. Try HTML product extraction (if we still don't have enough)
      if (allProducts.length === 0) {
        const homeProducts = extractProducts(homeHtml, baseUrl);
        if (homeProducts.length > 0) {
          console.log(`[EnhancedScraper] ✓ Found ${homeProducts.length} products/items on homepage via HTML`);
          allProducts.push(...homeProducts);
        }
      }

      for (const page of subPages) {
        const pageText = extractText(page.html, baseUrl);
        allHeadings.push(...pageText.headings);
        allParagraphs.push(...pageText.paragraphs);

        // Extract products from shop/products pages (only if we haven't got enough from Shopify API)
        if ((page.pageType === 'shop' || page.pageType === 'portfolio') && allProducts.length < 50) {
          const pageProducts = extractProducts(page.html, baseUrl);
          if (pageProducts.length > 0) {
            console.log(`[EnhancedScraper] Found ${pageProducts.length} products on ${page.pageType} page via HTML`);
            console.log(`[EnhancedScraper] Sample product:`, pageProducts[0]);
            allProducts.push(...pageProducts);
          }
        }

        if (page.pageType === 'services') {
          allServices = [...new Set([...allServices, ...pageText.services])];
          // If no services found via section detection, use headings from the services page
          if (allServices.length === 0 && pageText.headings.length > 0) {
            allServices = pageText.headings
              .filter(h => h.level >= 2 && h.level <= 4)
              .map(h => h.text)
              .slice(0, 8);
          }
        }

        if (pageText.features.length > 0) {
          allFeatures = [...new Set([...allFeatures, ...pageText.features])];
        }

        if (page.pageType === 'testimonials' || pageText.testimonials.length > 0) {
          allTestimonials.push(...pageText.testimonials);
        }

        if (page.pageType === 'about' && (pageText.aboutContent || pageText.paragraphs.length > 0)) {
          aboutContent = pageText.aboutContent || pageText.paragraphs.filter(p => p.length > 50).slice(0, 3).join(' ');
        }

        if (page.pageType === 'pricing') {
          allPricingText.push(...pageText.pricingText);
        }

        if (pageText.faqItems.length > 0) {
          allFaqItems.push(...pageText.faqItems);
        }

        if (pageText.ctaButtons.length > 0) {
          allCtaButtons.push(...pageText.ctaButtons);
        }
      }

      // Also check contact extraction from footer
      const footerPhone = homeText.footerPhone || contact.phone;
      const footerEmail = homeText.footerEmail || contact.email;
      const footerAddress = homeText.footerAddress || contact.address;

      // Deduplicate testimonials
      const uniqueTestimonials = allTestimonials
        .filter((t, i, arr) => arr.findIndex(x => x.text === t.text) === i)
        .slice(0, 6);

      // Deduplicate products by name
      const uniqueProducts = allProducts
        .filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i)
        .slice(0, 50);

      console.log(`[EnhancedScraper] Total unique products: ${uniqueProducts.length}`);

      // Classify images: find best logo and hero
      const logo = allImages.find(img => img.type === 'logo')?.url || null;
      const heroImage = allImages.find(img => img.type === 'hero')?.url ||
                        allImages.find(img => img.type === 'other' && !img.url.includes('logo') && img.url !== logo)?.url ||
                        null;
      const galleryImages = allImages
        .filter(img => img.type !== 'logo' && img.type !== 'icon' && img.type !== 'background' && img.url !== logo && img.url !== heroImage)
        .map(img => img.url)
        .slice(0, 20);

      // Build raw text summary for LLM context
      const rawText = [
        `Title: ${homeText.title}`,
        `Meta Description: ${homeText.metaDescription}`,
        `\nHeadings:\n${allHeadings.map(h => `${'#'.repeat(h.level)} ${h.text}`).join('\n')}`,
        `\nAbout: ${aboutContent}`,
        `\nServices: ${allServices.join(', ')}`,
        `\nFeatures: ${allFeatures.join(', ')}`,
        `\nTestimonials:\n${uniqueTestimonials.map(t => `- ${t.name}: "${t.text}"`).join('\n')}`,
        `\nKey Paragraphs:\n${allParagraphs.slice(0, 15).join('\n')}`,
        `\nCTA Buttons: ${allCtaButtons.map(c => c.label).join(', ')}`,
        `\nPricing: ${allPricingText.join(', ')}`,
        `\nFAQ:\n${allFaqItems.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n')}`,
        `\nFooter: ${homeText.footerContent}`,
        `\nContact: Phone: ${footerPhone || 'N/A'}, Email: ${footerEmail || 'N/A'}, Address: ${footerAddress || 'N/A'}`,
      ].join('\n').slice(0, 8000); // Limit for LLM context

      // Extract navigation links for classification
      const navLinks = extractNavigationMenuLinks(allHtml);
      
      // Extract JSON-LD for high-confidence business type detection
      const jsonLd = extractJsonLd(allHtml);
      const businessType = detectBusinessType(
        allHtml + ' ' + homeText.title + ' ' + homeText.metaDescription, 
        uniqueProducts.length,
        url,
        jsonLd,
        allHtml,
        navLinks
      );

      // Make colors business-type aware: use extracted colors if they're not generic defaults,
      // otherwise use business-type appropriate colors
      const finalColors = getBusinessTypeColors(colors, businessType);

      const elapsed = Date.now() - startTime;
      console.log(`[EnhancedScraper] Completed in ${elapsed}ms | Images: ${allImages.length} | Products: ${uniqueProducts.length} | Services: ${allServices.length} | Testimonials: ${uniqueTestimonials.length}`);

      return {
        name: homeText.title || new URL(url).hostname,
        description: homeText.metaDescription || aboutContent || '',
        logo,
        heroImage,
        galleryImages,
        primaryColor: finalColors.primary,
        secondaryColor: finalColors.secondary,
        businessType,
        services: allServices.slice(0, 10),
        features: allFeatures.slice(0, 10),
        products: uniqueProducts,
        phone: footerPhone,
        email: footerEmail,
        address: footerAddress,
        city: null,
        socialLinks: contact.socialLinks,
        aboutContent,
        testimonials: uniqueTestimonials,
        confidence: this.calculateConfidence(allImages, homeText, contact, allServices, uniqueTestimonials),
        sourceType: 'website',
        scrapedAt: new Date().toISOString(),
        // Enhanced fields for LLM
        rawText,
        scrapedImages: allImages,
      };
    } catch (error) {
      console.error('[EnhancedScraper] Error:', error);
      const hostname = (() => { try { return new URL(url).hostname; } catch { return 'Unknown'; } })();
      return {
        name: hostname,
        description: '',
        logo: null,
        heroImage: null,
        galleryImages: [],
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        businessType: 'service',
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
        rawText: '',
        scrapedImages: [],
      };
    }
  }

  private calculateConfidence(
    images: ScrapedImage[],
    text: ExtractedText,
    contact: ContactInfo,
    services: string[],
    testimonials: Testimonial[]
  ): 'high' | 'medium' | 'low' {
    let score = 0;
    if (text.title && text.title.length > 3) score += 2;
    if (text.metaDescription && text.metaDescription.length > 20) score += 1;
    if (images.filter(i => i.type !== 'icon' && i.type !== 'background').length >= 3) score += 2;
    if (images.some(i => i.type === 'logo')) score += 1;
    if (services.length >= 3) score += 2;
    if (testimonials.length >= 2) score += 1;
    if (contact.email || contact.phone) score += 1;
    if (Object.keys(contact.socialLinks).length >= 1) score += 1;
    if (text.aboutContent && text.aboutContent.length > 50) score += 1;
    if (score >= 8) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  }
}

export const enhancedScraperService = new EnhancedScraperService();
