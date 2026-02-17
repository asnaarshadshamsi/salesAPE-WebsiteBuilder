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

  // Extract <img> tags
  const imgRegex = /<img\s+([^>]*?)(?:\/?>)/gi;
  let m;
  while ((m = imgRegex.exec(cleaned)) !== null) {
    const attrs = m[1];
    // Try src, then data-src, then data-lazy-src
    const srcMatch =
      attrs.match(/\bsrc=["']([^"']+)["']/i) ||
      attrs.match(/data-src=["']([^"']+)["']/i) ||
      attrs.match(/data-lazy-src=["']([^"']+)["']/i);
    if (!srcMatch) continue;
    const url = resolveUrl(srcMatch[1], baseUrl);
    if (!url || seen.has(url)) continue;
    seen.add(url);

    const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
    const widthMatch = attrs.match(/width=["']?(\d+)/i);
    const heightMatch = attrs.match(/height=["']?(\d+)/i);
    const classMatch = attrs.match(/class=["']([^"']*)["']/i);

    const w = widthMatch ? parseInt(widthMatch[1]) : undefined;
    const h = heightMatch ? parseInt(heightMatch[1]) : undefined;
    // Skip tiny images & tracking pixels
    if ((w && w < 20) || (h && h < 20)) continue;
    if (url.includes('pixel') || url.includes('track') || url.includes('analytics')) continue;
    if (url.includes('facebook.com/tr') || url.includes('google-analytics') || url.includes('doubleclick')) continue;
    if (url.endsWith('.svg') && (w && w < 40)) continue; // Skip small SVG icons

    const alt = altMatch ? altMatch[1] : '';
    const ctx = classMatch ? classMatch[1] : '';
    images.push({ url, alt, width: w, height: h, type: classifyImage(url, alt, ctx) });
  }

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
  const emailMatch = content.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const phoneMatch = content.match(/(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  const addressMatch = content.match(/<[^>]+(?:class|id)=["'][^"']*address[^"']*["'][^>]*>([\s\S]{10,200}?)<\/[^>]+>/i);

  return {
    footerContent: text,
    footerEmail: emailMatch ? emailMatch[1] : null,
    footerPhone: phoneMatch ? phoneMatch[1].replace(/[^\d+]/g, '') : null,
    footerAddress: addressMatch ? stripTags(addressMatch[1]) : null,
  };
}

// ==================== CONTACT EXTRACTION ====================

function extractContact(html: string): ContactInfo {
  // Phone — look for tel: links first, then patterns
  const telMatch = html.match(/href=["']tel:([^"']+)["']/i);
  let phone: string | null = null;
  if (telMatch) {
    phone = telMatch[1].replace(/[^\d+]/g, '');
  } else {
    const phoneRegex = /(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
    const phoneMatches = html.match(phoneRegex);
    if (phoneMatches) {
      phone = phoneMatches[0].replace(/[^\d+]/g, '');
      if (phone.length < 10) phone = null;
    }
  }

  // Email — look for mailto: first, then patterns
  const mailtoMatch = html.match(/href=["']mailto:([^"'?]+)/i);
  let email: string | null = null;
  if (mailtoMatch) {
    email = mailtoMatch[1];
  } else {
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const emailMatches = html.match(emailRegex) || [];
    email = emailMatches.find(e =>
      !e.includes('example.com') &&
      !e.includes('sentry') &&
      !e.includes('webpack') &&
      !e.includes('wixpress') &&
      !e.includes('schema.org')
    ) || null;
  }

  // Address — look for schema.org, microdata, or address elements
  let address: string | null = null;
  const schemaAddress = html.match(/"streetAddress"\s*:\s*"([^"]+)"/i);
  if (schemaAddress) {
    address = schemaAddress[1];
  } else {
    const addressMatch = html.match(/<address[^>]*>([\s\S]{10,300}?)<\/address>/i) ||
                         html.match(/<[^>]+(?:class|id)=["'][^"']*address[^"']*["'][^>]*>([\s\S]{10,300}?)<\/[^>]+>/i);
    if (addressMatch) {
      address = stripTags(addressMatch[1] || addressMatch[2]).slice(0, 200);
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
    if (match) socialLinks[platform as keyof SocialLinks] = match[0];
  }

  return { phone, email, address, socialLinks };
}

// ==================== COLOR EXTRACTION ====================

function extractColors(html: string): { primary: string; secondary: string } {
  const colors: string[] = [];

  // Theme-color meta tag
  const themeColor = html.match(/<meta\s+name=["']theme-color["']\s+content=["']([^"']+)["']/i);
  if (themeColor) colors.push(themeColor[1]);

  // CSS custom properties (--primary, --brand, etc.)
  const cssVarRegex = /--(?:primary|brand|main|accent|theme)[-\w]*:\s*([^;]+)/gi;
  let m;
  while ((m = cssVarRegex.exec(html)) !== null) colors.push(m[1].trim());

  // Background colors from inline styles
  const bgColorRegex = /background(?:-color)?:\s*(#[0-9a-fA-F]{3,8})/gi;
  while ((m = bgColorRegex.exec(html)) !== null) colors.push(m[1]);

  // Color values from inline styles
  const colorRegex = /[^-]color:\s*(#[0-9a-fA-F]{3,8})/gi;
  while ((m = colorRegex.exec(html)) !== null) colors.push(m[1]);

  // Normalize and filter
  const validHex = colors
    .map(c => normalizeToHex(c))
    .filter((c): c is string => !!c && !isGrayscale(c));

  // Count frequency
  const freq = new Map<string, number>();
  validHex.forEach(c => freq.set(c.toLowerCase(), (freq.get(c.toLowerCase()) || 0) + 1));
  const sorted = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c);

  return {
    primary: sorted[0] || '#3b82f6',
    secondary: sorted.find(c => !areSimilar(c, sorted[0] || '#3b82f6')) || '#8b5cf6',
  };
}

function normalizeToHex(color: string): string | null {
  color = color.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  if (/^#[0-9a-f]{3}$/i.test(color)) return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  const rgb = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) return '#' + [rgb[1], rgb[2], rgb[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
  return null;
}

function isGrayscale(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(b - r)) < 30;
}

function areSimilar(a: string, b: string): boolean {
  const r1 = parseInt(a.slice(1, 3), 16), g1 = parseInt(a.slice(3, 5), 16), b1 = parseInt(a.slice(5, 7), 16);
  const r2 = parseInt(b.slice(1, 3), 16), g2 = parseInt(b.slice(3, 5), 16), b2 = parseInt(b.slice(5, 7), 16);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2) < 80;
}

// ==================== BUSINESS TYPE DETECTION ====================

function detectBusinessType(allText: string): BusinessType {
  const lower = allText.toLowerCase();
  const scores: Partial<Record<BusinessType, number>> = {};

  const patterns: [BusinessType, RegExp][] = [
    ['ecommerce', /\b(shop|store|cart|checkout|buy now|add to cart|product|ecommerce|shipping|order)\b/g],
    ['restaurant', /\b(restaurant|menu|cuisine|dining|chef|reservation|takeout|delivery|food|bistro|cafe|catering)\b/g],
    ['agency', /\b(agency|creative|branding|digital marketing|campaign|studio|design agency)\b/g],
    ['healthcare', /\b(health|medical|clinic|doctor|hospital|patient|appointment|dental|therapy|wellness)\b/g],
    ['fitness', /\b(fitness|gym|workout|training|exercise|yoga|personal trainer|membership|crossfit)\b/g],
    ['beauty', /\b(beauty|salon|spa|hair|makeup|skincare|cosmetic|manicure|pedicure|barber)\b/g],
    ['realestate', /\b(real estate|property|realtor|homes? for sale|apartment|listing|mortgage|broker)\b/g],
    ['education', /\b(education|school|course|learning|training|academy|tutor|student|enroll|university)\b/g],
    ['portfolio', /\b(portfolio|my work|showcase|freelance|designer|developer)\b/g],
    ['startup', /\b(startup|saas|platform|app|sign up|free trial|pricing plan|beta)\b/g],
  ];

  for (const [type, pattern] of patterns) {
    const matches = lower.match(pattern);
    if (matches) scores[type] = (scores[type] || 0) + matches.length;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0 && sorted[0][1] >= 2) return sorted[0][0] as BusinessType;
  return 'service';
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
    about: 1, services: 2, pricing: 3, contact: 4, portfolio: 5,
    testimonials: 6, team: 7, blog: 8, other: 10,
  };
  links.sort((a, b) => (priority[a.type] || 10) - (priority[b.type] || 10));
  return links.slice(0, 6); // Max 6 sub-pages
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
      let aboutContent = homeText.aboutContent;
      const allParagraphs = [...homeText.paragraphs];
      const allHeadings = [...homeText.headings];
      const allPricingText = [...homeText.pricingText];
      const allFaqItems = [...homeText.faqItems];
      const allCtaButtons = [...homeText.ctaButtons];

      for (const page of subPages) {
        const pageText = extractText(page.html, baseUrl);
        allHeadings.push(...pageText.headings);
        allParagraphs.push(...pageText.paragraphs);

        if (page.pageType === 'services' || page.pageType === 'portfolio') {
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

      const businessType = detectBusinessType(allHtml + ' ' + homeText.title + ' ' + homeText.metaDescription);

      const elapsed = Date.now() - startTime;
      console.log(`[EnhancedScraper] Completed in ${elapsed}ms | Images: ${allImages.length} | Services: ${allServices.length} | Testimonials: ${uniqueTestimonials.length}`);

      return {
        name: homeText.title || new URL(url).hostname,
        description: homeText.metaDescription || aboutContent || '',
        logo,
        heroImage,
        galleryImages,
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        businessType,
        services: allServices.slice(0, 10),
        features: allFeatures.slice(0, 10),
        products: [],
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
