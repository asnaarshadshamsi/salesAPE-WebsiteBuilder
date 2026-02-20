/**
 * Template Field Generator Service
 * Generates complete BusinessData for the LandingTemplate.
 *
 * Strategy:
 *  1. If Cohere API key is set AND we have rawText from scraping → call LLM
 *     to generate a complete, high-quality BusinessData JSON.
 *  2. Overlay scraped images (logo, hero, gallery, team) onto the LLM output.
 *  3. If LLM fails or no API key → fall back to structural assembly from raw data.
 */

import { BusinessData } from '@/components/template/types/landing';
import { BusinessType, Testimonial } from '@/types';
import { decodeHTMLEntities } from '@/lib/utils';

const COHERE_API_KEY = process.env.COHERE_API_KEY || process.env.cohere_api_key || '';
const COHERE_API_URL = 'https://api.cohere.ai/v1';

// ==================== INPUT TYPE ====================

export interface MergedData {
  name: string;
  description: string;
  logo: string | null;
  heroImage: string | null;
  galleryImages: string[];
  primaryColor: string;
  secondaryColor: string;
  businessType: BusinessType;
  industry?: string;
  category?: string;
  services: string[];
  features: string[];
  products: Array<{
    name: string;
    description?: string;
    price?: number;
    salePrice?: number;
    image?: string;
    category?: string;
  }>;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  socialLinks: any;
  calendlyUrl?: string;
  openingHours?: Record<string, string>;
  aboutContent?: string;
  testimonials: Testimonial[];
  targetAudience?: string;
  tone?: string;
  uniqueSellingPoints?: string[];
  keyMessages?: string[];
  callToAction?: string;
  confidence: 'high' | 'medium' | 'low';
  // Additional context supplied by the enhanced scraper
  rawText?: string;
  scrapedImages?: Array<{
    url: string;
    alt: string;
    type: string;
  }>;
}

// ==================== MAIN CLASS ====================

export class TemplateFieldGeneratorService {
  // ------------------------------------------------------------------
  //  Public entry point (async — tries LLM first, falls back)
  // ------------------------------------------------------------------

  async generateWithLLM(merged: MergedData): Promise<BusinessData> {
    console.log('[TemplateGenerator] Generating BusinessData (LLM path)');

    if (COHERE_API_KEY && merged.rawText && merged.rawText.length > 50) {
      try {
        const llmResult = await this.callLLMForBusinessData(merged);
        if (llmResult) {
          console.log('[TemplateGenerator] LLM generated BusinessData successfully');
          return this.overlayImages(llmResult, merged);
        }
      } catch (err) {
        console.error('[TemplateGenerator] LLM generation failed, falling back:', err);
      }
    }

    // Fallback
    console.log('[TemplateGenerator] Using structural assembly fallback');
    return this.generate(merged);
  }

  // ------------------------------------------------------------------
  //  LLM call
  // ------------------------------------------------------------------

  private async callLLMForBusinessData(merged: MergedData): Promise<BusinessData | null> {
    const prompt = this.buildLLMPrompt(merged);

    // Try Chat API first (command-r-plus), then Generate API (command)
    let result = await this.tryChatAPI(prompt);
    if (!result) result = await this.tryGenerateAPI(prompt);
    return result;
  }

  private async tryChatAPI(prompt: string): Promise<BusinessData | null> {
    try {
      const resp = await fetch(`${COHERE_API_URL}/chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'command-r-plus',
          message: prompt,
          temperature: 0.55,
          max_tokens: 4000,
        }),
      });
      if (!resp.ok) {
        console.warn('[TemplateGenerator] Chat API returned', resp.status);
        return null;
      }
      const data = await resp.json();
      const text = data.text || data.generations?.[0]?.text;
      if (!text) return null;
      return this.parseBusinessDataJSON(text);
    } catch (e) {
      console.error('[TemplateGenerator] Chat API error:', e);
      return null;
    }
  }

  private async tryGenerateAPI(prompt: string): Promise<BusinessData | null> {
    try {
      const resp = await fetch(`${COHERE_API_URL}/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
          'Cohere-Version': '2022-12-06',
        },
        body: JSON.stringify({
          model: 'command',
          prompt: prompt + '\n\nReturn ONLY a valid JSON object:\n',
          max_tokens: 4000,
          temperature: 0.55,
          stop_sequences: ['---'],
        }),
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      const text = data.generations?.[0]?.text?.trim();
      if (!text) return null;
      return this.parseBusinessDataJSON(text);
    } catch {
      return null;
    }
  }

  // ------------------------------------------------------------------
  //  Prompt construction
  // ------------------------------------------------------------------

  private buildLLMPrompt(merged: MergedData): string {
    const year = new Date().getFullYear();
    
    // Specific instructions based on business type
    const foodTypes = ['restaurant', 'cafe', 'bakery', 'catering', 'food', 'pizzeria', 'bistro', 'diner', 'eatery', 'bar', 'pub', 'grill', 'steakhouse', 'sushi', 'fastfood', 'takeaway', 'foodtruck'];
    const isFoodBusiness = foodTypes.some(t => merged.businessType?.toLowerCase().includes(t)) ||
      (merged.rawText || '').toLowerCase().includes('menu') ||
      ['dine-in', 'dine in', 'takeout', 'delivery', 'catering'].some(w => merged.services.map(s => s.toLowerCase()).some(s => s.includes(w)));

    let businessSpecificInstructions = '';
    if (merged.businessType === 'fitness') {
      businessSpecificInstructions = 'IMPORTANT FOR FITNESS/GYM: Focus on transformation and membership programs. Memberships are SERVICES not products. Use fitness-oriented CTAs.\\n';
    } else if (merged.businessType === 'ecommerce') {
      businessSpecificInstructions = 'IMPORTANT FOR ECOMMERCE: Include products section with items, prices, categories. Use shopping CTAs.\\n';
    } else if (isFoodBusiness) {
      businessSpecificInstructions = `IMPORTANT FOR FOOD/RESTAURANT BUSINESS:
- The "services" section represents the MENU or dining OPTIONS (e.g. Dine-In, Takeout, Delivery, Catering, Breakfast, Lunch, Dinner, Chef Specials, Seasonal Menu).
- Each service item MUST have a mouth-watering, food-specific description that highlights the experience, ingredients, atmosphere, or convenience. NEVER use generic phrases like "Professional X solutions tailored to your needs".
- Use sensory and emotional language (e.g. "Savour the warmth of freshly baked bread", "Experience the sizzle of our signature grill", "Enjoy restaurant-quality meals in the comfort of your home").
- services.title should be something like "Our Menu", "What We Offer", "The Experience", or "How We Serve You".
- services.subtitle should be a 1-sentence food-themed teaser.
- The about.description MUST be rewritten from scratch as a warm, inviting story about the restaurant — its founding, cuisine philosophy, and what makes it special. Do NOT copy scraped text verbatim.
- nav.links should use food-relevant labels: Menu, About, Gallery, Reservations, Contact (not generic "Services").
`;
    }

    return `You are an expert copywriter and web designer. Based on the scraped website data below, generate a COMPLETE website content JSON for a landing page.

RULES:
1. Generate NEW, compelling copy — do NOT just copy scraped text verbatim. Rewrite everything in brand-appropriate language.
2. Keep the same brand tone and style detected from the content.
3. Fill EVERY section — no empty strings or placeholder text.
4. If testimonials are missing, generate 3 realistic, specific, glowing testimonials relevant to this exact ${merged.businessType} business.
5. If services are missing, infer 4-6 services from the scraped content — make each description 2-3 compelling, specific sentences.
6. If features are missing, generate 4 relevant, specific features with concrete benefits.
7. Service descriptions MUST be specific to the business type — never generic phrases like "Professional X solutions tailored to your needs" or "We take pride in delivering personalized solutions".
7. Generate realistic stats (e.g. "500+", "98%", "24/7", "10+").
8. Use action-oriented CTAs matching the business type.
9. DO NOT include image URLs in the JSON — images are handled separately.
10. For ${merged.businessType === 'ecommerce' ? 'ECOMMERCE' : 'non-ecommerce'} businesses, ${merged.businessType === 'ecommerce' ? 'INCLUDE a products section with realistic items, prices, and categories' : 'OMIT the products section unless specific products were scraped'}.

${businessSpecificInstructions}
BUSINESS INFO:
- Name: ${merged.name}
- Type: ${merged.businessType}
- Industry: ${merged.industry || 'Not specified'}
- Target Audience: ${merged.targetAudience || 'General'}
${merged.products.length > 0 ? `- Products found: ${merged.products.length} items` : '- No products scraped'}

SCRAPED CONTENT:
${merged.rawText ? merged.rawText.slice(0, 5000) : 'No scraped content available.'}

EXTRACTED DATA:
- Services: ${merged.services.length > 0 ? merged.services.join(', ') : 'Not found'}
- Features: ${merged.features.length > 0 ? merged.features.join(', ') : 'Not found'}
- About: ${merged.aboutContent || merged.description || 'Not found'}
- Testimonials: ${merged.testimonials.length > 0 ? merged.testimonials.map(t => `${t.name}: "${t.text}"`).join(' | ') : 'None found'}
- Phone: ${merged.phone || 'N/A'}
- Email: ${merged.email || 'N/A'}
- Address: ${merged.address || 'N/A'}

Return a JSON object that matches this EXACT schema (no extra keys, no markdown, no explanation):

{
  "brand": {
    "name": "${merged.name}",
    "tagline": "Short memorable tagline (3-8 words)"
  },
  "hero": {
    "headline": "Compelling headline (5-12 words)",
    "subheadline": "Engaging subheadline explaining value (15-25 words)",
    "cta": { "label": "Primary CTA (2-4 words)", "href": "#contact" },
    "secondaryCta": { "label": "Secondary CTA (2-4 words)", "href": "#about" }
  },
  "nav": {
    "links": [
      { "label": "About", "href": "#about" },
      { "label": "Services", "href": "#services" },
      { "label": "Testimonials", "href": "#testimonials" },
      { "label": "Contact", "href": "#contact" }
    ]
  },
  "about": {
    "title": "About Us" or "Our Story" or similar engaging title,
    "description": "Write a compelling, warm, and engaging 3-5 paragraph About section (150-250 words). Start with what makes the business special, then explain their mission/values, include what they offer, and end with a welcoming statement. Use conversational tone with contractions (we're, you'll, that's). Make it personal and authentic, as if speaking directly to customers. Example style: 'We're more than just a [type] - we're a place where real people come together to [goal]. We get it - [common challenge]. That's why we're here to [solution]...'"
  },
  "features": {
    "title": "Why Choose Us or similar",
    "subtitle": "Brief subtitle",
    "items": [
      { "icon": "✦", "title": "Feature", "description": "1-2 sentence description" },
      { "icon": "◈", "title": "Feature", "description": "1-2 sentence description" },
      { "icon": "▲", "title": "Feature", "description": "1-2 sentence description" },
      { "icon": "●", "title": "Feature", "description": "1-2 sentence description" }
    ]
  },
  "stats": {
    "items": [
      { "value": "100+", "label": "Projects" },
      { "value": "98%", "label": "Satisfaction" },
      { "value": "24/7", "label": "Support" },
      { "value": "10+", "label": "Years" }
    ]
  },
  "services": {
    "title": "Our Services or similar",
    "subtitle": "Brief subtitle",
    "items": [
      { "title": "Service 1", "description": "2-3 sentences" },
      { "title": "Service 2", "description": "2-3 sentences" },
      { "title": "Service 3", "description": "2-3 sentences" },
      { "title": "Service 4", "description": "2-3 sentences" }
    ]
  },
  "products": {
    "title": "Featured Products or Shop Our Collection (for ecommerce only)",
    "subtitle": "Brief subtitle",
    "items": [
      { "name": "Product 1", "description": "Brief description", "price": 29.99, "salePrice": 24.99, "category": "Category" },
      { "name": "Product 2", "description": "Brief description", "price": 49.99, "category": "Category" }
    ]
  },
  "testimonials": {
    "title": "What Our Clients Say",
    "items": [
      { "quote": "Testimonial (20-50 words)", "author": "Full Name", "role": "Title/Company" },
      { "quote": "Testimonial (20-50 words)", "author": "Full Name", "role": "Title/Company" },
      { "quote": "Testimonial (20-50 words)", "author": "Full Name", "role": "Title/Company" }
    ]
  },
  "cta": {
    "title": "Ready to Get Started?",
    "description": "Compelling CTA description",
    "buttonLabel": "CTA button text",
    "buttonHref": "#contact"
  },
  "footer": {
    "description": "Brief company description for footer",
    "links": [
      { "label": "About", "href": "#about" },
      { "label": "Services", "href": "#services" },
      { "label": "Contact", "href": "#contact" }
    ],
    "socials": [],
    "copyright": "© ${year} ${merged.name}. All rights reserved."
  },
  "leadForm": {
    "eyebrow": "Short section label matching the business (e.g. 'Order Enquiry', 'Fragrance Consultation', 'Book a Session', 'Reserve Your Table', 'Membership Enquiry')",
    "heading": "Compelling heading for the lead capture form (e.g. 'Find Your Signature Scent', 'Request a Custom Piece', 'Book Your Membership', 'Reserve Your Table') — MUST match the exact nature of this business, NOT a generic phrase",
    "subheading": "1-2 sentences inviting the visitor to fill in the form, referencing what this business specifically offers (e.g. for a perfume brand: 'Describe the mood or occasions you wear fragrance for and our experts will recommend the perfect scent.'; for a gym: 'Tell us your fitness goals and we'll match you to the ideal membership plan.')",
    "messagePlaceholder": "Context-specific textarea placeholder that tells the visitor exactly what to write (e.g. for perfume: 'Describe your favourite scent notes — woody, floral, oud? Any occasion in mind?'; for clothing: 'Your size, preferred colour, occasion or any custom requirements…')",
    "submitLabel": "Action-oriented button label (e.g. 'Find My Scent', 'Send Enquiry', 'Book Free Session', 'Reserve Table', 'Request a Quote')",
    "successTitle": "Short confirmation heading after submission (e.g. 'Your Enquiry is Sent!', 'Consultation Booked!')",
    "successMessage": "1-2 sentence follow-up message telling the user what happens next."
  }
}

Generate content SPECIFIC to this ${merged.businessType} business. Be creative but accurate.
JSON:`;
  }

  // ------------------------------------------------------------------
  //  Parse LLM response
  // ------------------------------------------------------------------

  private parseBusinessDataJSON(text: string): BusinessData | null {
    try {
      let jsonStr = text.trim();
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      jsonStr = jsonMatch[0];

      const p = JSON.parse(jsonStr);
      if (!p.brand?.name || !p.hero?.headline) {
        console.warn('[TemplateGenerator] Parsed JSON missing required fields');
        return null;
      }

      return {
        brand: { 
          name: p.brand.name, 
          logo: p.brand.logo, 
          tagline: p.brand.tagline,
          businessType: p.brand.businessType,
          primaryColor: p.brand.primaryColor,
          secondaryColor: p.brand.secondaryColor,
        },
        hero: {
          headline: p.hero.headline,
          subheadline: p.hero.subheadline,
          cta: p.hero.cta || { label: 'Get Started', href: '#contact' },
          secondaryCta: p.hero.secondaryCta,
          image: p.hero.image,
        },
        nav: p.nav || { links: [] },
        about: p.about || undefined,
        features: p.features || undefined,
        stats: p.stats || undefined,
        services: p.services || undefined,
        products: p.products || undefined,
        testimonials: p.testimonials || undefined,
        cta: p.cta || undefined,
        contact: p.contact || undefined,
        footer: p.footer || undefined,
        leadForm: p.leadForm ? {
          eyebrow: p.leadForm.eyebrow,
          heading: p.leadForm.heading,
          subheading: p.leadForm.subheading,
          messagePlaceholder: p.leadForm.messagePlaceholder,
          submitLabel: p.leadForm.submitLabel,
          successTitle: p.leadForm.successTitle,
          successMessage: p.leadForm.successMessage,
        } : undefined,
      };
    } catch (err) {
      console.error('[TemplateGenerator] Failed to parse LLM JSON:', err);
      return null;
    }
  }

  // ------------------------------------------------------------------
  //  Overlay scraped images onto LLM-generated data
  // ------------------------------------------------------------------

  private overlayImages(data: BusinessData, merged: MergedData): BusinessData {
    // Logo
    if (merged.logo) data.brand.logo = merged.logo;

    // Business type
    if (merged.businessType) data.brand.businessType = merged.businessType;

    // Colors - override with scraped colors
    if (merged.primaryColor) data.brand.primaryColor = merged.primaryColor;
    if (merged.secondaryColor) data.brand.secondaryColor = merged.secondaryColor;

    // Decode HTML entities in text fields from LLM
    if (data.hero.headline) data.hero.headline = decodeHTMLEntities(data.hero.headline);
    if (data.hero.subheadline) data.hero.subheadline = decodeHTMLEntities(data.hero.subheadline);
    if (data.brand.tagline) data.brand.tagline = decodeHTMLEntities(data.brand.tagline);
    
    // Decode About section
    if (data.about?.description) {
      data.about.description = decodeHTMLEntities(data.about.description);
    }
    if (data.about?.title) {
      data.about.title = decodeHTMLEntities(data.about.title);
    }

    // Decode features
    if (data.features?.items) {
      data.features.items = data.features.items.map(item => ({
        ...item,
        title: decodeHTMLEntities(item.title),
        description: decodeHTMLEntities(item.description),
      }));
    }

    // Decode services
    if (data.services?.items) {
      data.services.items = data.services.items.map(item => ({
        ...item,
        title: decodeHTMLEntities(item.title),
        description: decodeHTMLEntities(item.description),
      }));
    }

    // Decode testimonials
    if (data.testimonials?.items) {
      data.testimonials.items = data.testimonials.items.map(item => ({
        ...item,
        quote: decodeHTMLEntities(item.quote),
        author: decodeHTMLEntities(item.author),
        role: item.role ? decodeHTMLEntities(item.role) : undefined,
      }));
    }

    // Hero image
    if (merged.heroImage) data.hero.image = merged.heroImage;

    // About image — use first gallery image
    if (data.about && merged.galleryImages.length > 0) {
      data.about.image = merged.galleryImages[0];
    }

    // Service images — distribute gallery images across service items
    if (data.services?.items && merged.galleryImages.length > 1) {
      const offset = data.about ? 1 : 0; // skip first if used for about
      data.services.items.forEach((item, i) => {
        const imgIdx = offset + i;
        if (merged.galleryImages[imgIdx]) {
          item.image = merged.galleryImages[imgIdx];
        }
      });
    }

    // Product images → service images as well
    if (data.services?.items && merged.products.length > 0) {
      merged.products.forEach((product, i) => {
        if (data.services!.items[i] && product.image) {
          data.services!.items[i].image = product.image;
        }
        if (data.services!.items[i] && product.price) {
          data.services!.items[i].price = `$${product.price}`;
        }
      });
    }

    // Testimonial avatars from team-type images
    if (data.testimonials?.items && merged.scrapedImages) {
      const teamImages = merged.scrapedImages.filter(img => img.type === 'team');
      data.testimonials.items.forEach((item, i) => {
        if (teamImages[i]) item.avatar = teamImages[i].url;
      });
    }

    // Contact info and calendly URL
    if (!data.contact) {
      data.contact = {};
    }
    if (merged.email) data.contact.email = merged.email;
    if (merged.phone) data.contact.phone = merged.phone;
    if (merged.address) data.contact.address = merged.address;
    if (merged.city) data.contact.city = merged.city;
    if (merged.calendlyUrl) data.contact.calendlyUrl = merged.calendlyUrl;

    // Footer socials
    if (data.footer && merged.socialLinks) {
      const socials = Object.entries(merged.socialLinks)
        .filter(([, href]) => !!href)
        .map(([platform, href]) => ({ platform, href: href as string }));
      if (socials.length > 0) data.footer.socials = socials;
    }

    return data;
  }

  // ==================================================================
  //  Structural assembly fallback (no LLM)
  // ==================================================================

  generate(merged: MergedData): BusinessData {
    console.log('[TemplateGenerator] Generating BusinessData via structural assembly');
    const config = this.getBusinessTypeConfig(merged.businessType);

    return {
      brand: {
        name: merged.name,
        logo: merged.logo || undefined,
        tagline: merged.keyMessages?.[0] || merged.category || merged.industry || config.heroTag,
        businessType: merged.businessType,
        primaryColor: merged.primaryColor || '#3b82f6',
        secondaryColor: merged.secondaryColor || '#8b5cf6',
      },
      hero: this.generateHero(merged, config),
      nav: this.generateNav(merged),
      about: this.generateAbout(merged, config),
      features: this.generateFeatures(merged, config),
      stats: this.generateStats(merged),
      services: this.generateServices(merged, config),
      products: this.generateProducts(merged),
      testimonials: this.generateTestimonials(merged, config),
      cta: this.generateCta(merged, config),
      contact: {
        email: merged.email || undefined,
        phone: merged.phone || undefined,
        address: merged.address || undefined,
        city: merged.city || undefined,
        calendlyUrl: merged.calendlyUrl || undefined,
      },
      footer: this.generateFooter(merged),
    };
  }

  // ------------------------------------------------------------------
  //  Per-business-type config
  // ------------------------------------------------------------------

  private getBusinessTypeConfig(type: BusinessType) {
    const configs: Record<string, {
      heroTag: string;
      primaryCTA: string;
      secondaryCTA: string;
      servicesTitle: string;
      featuresTitle: string;
      aboutTitle: string;
      contactTitle: string;
      testimonialTitle: string;
      defaultServices: string[];
      defaultFeatures: string[];
      defaultTestimonials: Testimonial[];
      defaultStats: { value: string; label: string }[];
    }> = {
      agency: {
        heroTag: 'Creative Agency',
        primaryCTA: 'View Our Work', secondaryCTA: 'Get Started',
        servicesTitle: 'What We Do', featuresTitle: 'Why Choose Us',
        aboutTitle: 'Who We Are', contactTitle: "Let's Create Together", testimonialTitle: 'Client Success Stories',
        defaultServices: ['Brand Strategy', 'Creative Design', 'Digital Marketing', 'Content Creation', 'Web Development', 'Social Media'],
        defaultFeatures: ['Expert Team', 'Data-Driven Results', 'Creative Excellence', 'On-Time Delivery'],
        defaultTestimonials: [
          { name: 'Michael Chen', text: 'Working with them transformed our brand. The results exceeded our expectations.', rating: 5 },
          { name: 'Sarah Johnson', text: 'Professional, creative, and always on time. Highly recommended!', rating: 5 },
          { name: 'David Martinez', text: 'Their strategic approach helped us achieve amazing growth.', rating: 5 },
        ],
        defaultStats: [{ value: '100+', label: 'Projects' }, { value: '50+', label: 'Happy Clients' }, { value: '98%', label: 'Satisfaction' }, { value: '24/7', label: 'Support' }],
      },
      ecommerce: {
        heroTag: 'Shop Online', primaryCTA: 'Shop Now', secondaryCTA: 'Browse Collection',
        servicesTitle: 'Why Shop With Us', featuresTitle: 'Our Advantages',
        aboutTitle: 'Our Story', contactTitle: 'Get In Touch', testimonialTitle: 'Customer Reviews',
        defaultServices: ['Fast Shipping', 'Easy Returns', 'Secure Checkout', '24/7 Support', 'Price Match', 'Gift Wrapping'],
        defaultFeatures: ['Free Shipping Over $50', '30-Day Returns', 'Secure Payment', 'Quality Guarantee'],
        defaultTestimonials: [
          { name: 'Jessica Lee', text: 'Great products and super fast shipping! Will definitely order again.', rating: 5 },
          { name: 'Robert Taylor', text: 'Excellent quality and customer service. Very satisfied with my purchase.', rating: 5 },
          { name: 'Amanda White', text: 'Best online shopping experience. Highly recommend!', rating: 5 },
        ],
        defaultStats: [{ value: '10K+', label: 'Products' }, { value: '50K+', label: 'Customers' }, { value: '4.9★', label: 'Rating' }, { value: '24hrs', label: 'Shipping' }],
      },
      restaurant: {
        heroTag: 'Fine Dining', primaryCTA: 'Reserve a Table', secondaryCTA: 'View Menu',
        servicesTitle: 'Our Services', featuresTitle: 'Why Dine With Us',
        aboutTitle: 'Our Story', contactTitle: 'Visit Us', testimonialTitle: 'What Our Guests Say',
        defaultServices: ['Dine-In', 'Takeout', 'Delivery', 'Private Events', 'Catering', 'Reservations'],
        defaultFeatures: ['Fresh Ingredients', 'Expert Chefs', 'Cozy Atmosphere', 'Full Bar'],
        defaultTestimonials: [
          { name: 'Emily Rodriguez', text: 'The best dining experience! Food was amazing and service was impeccable.', rating: 5 },
          { name: 'James Wilson', text: 'Fantastic atmosphere and delicious food. Our new favorite spot!', rating: 5 },
          { name: 'Lisa Anderson', text: 'Every dish was perfect. Can\'t wait to come back!', rating: 5 },
        ],
        defaultStats: [{ value: '5★', label: 'Rating' }, { value: '15+', label: 'Years' }, { value: '100+', label: 'Menu Items' }, { value: 'Daily', label: 'Fresh' }],
      },
      fitness: {
        heroTag: 'Transform Your Life', primaryCTA: 'Start Training', secondaryCTA: 'View Plans',
        servicesTitle: 'Programs', featuresTitle: 'Why Train With Us',
        aboutTitle: 'About Us', contactTitle: 'Get Started Today', testimonialTitle: 'Member Results',
        defaultServices: ['Personal Training', 'Group Classes', 'Nutrition Coaching', 'Online Programs', 'Fitness Assessments', 'Recovery'],
        defaultFeatures: ['Expert Trainers', 'State-of-the-Art Equipment', 'Flexible Schedules', 'Personalized Plans'],
        defaultTestimonials: [
          { name: 'Mark Stevens', text: 'Lost 30 pounds and feel amazing! Best investment I\'ve ever made.', rating: 5 },
          { name: 'Rachel Green', text: 'The trainers are incredible. They really care about your progress.', rating: 5 },
          { name: 'Kevin Brown', text: 'Great facility and even better results. Highly recommend!', rating: 5 },
        ],
        defaultStats: [{ value: '500+', label: 'Members' }, { value: '95%', label: 'Success Rate' }, { value: '10+', label: 'Trainers' }, { value: '24/7', label: 'Access' }],
      },
      healthcare: {
        heroTag: 'Your Health, Our Priority', primaryCTA: 'Book Appointment', secondaryCTA: 'Learn More',
        servicesTitle: 'Our Services', featuresTitle: 'Why Choose Us',
        aboutTitle: 'About Our Practice', contactTitle: 'Contact Us', testimonialTitle: 'Patient Testimonials',
        defaultServices: ['General Consultations', 'Preventive Care', 'Specialist Referrals', 'Lab Services', 'Emergency Care', 'Follow-up Care'],
        defaultFeatures: ['Board-Certified Doctors', 'Modern Equipment', 'Insurance Accepted', 'Same-Day Appointments'],
        defaultTestimonials: [
          { name: 'Susan Parker', text: 'Excellent care and very professional staff. I feel confident in their expertise.', rating: 5 },
          { name: 'Thomas Hill', text: 'They take time to listen and explain everything clearly. Highly recommended.', rating: 5 },
          { name: 'Jennifer Moore', text: 'Best healthcare experience. Caring staff and quality treatment.', rating: 5 },
        ],
        defaultStats: [{ value: '20+', label: 'Years' }, { value: '10K+', label: 'Patients' }, { value: '98%', label: 'Satisfaction' }, { value: '24/7', label: 'Emergency' }],
      },
      beauty: {
        heroTag: 'Enhance Your Beauty', primaryCTA: 'Book Now', secondaryCTA: 'View Services',
        servicesTitle: 'Our Services', featuresTitle: 'Why Choose Us',
        aboutTitle: 'About Us', contactTitle: 'Book Appointment', testimonialTitle: 'Client Reviews',
        defaultServices: ['Hair Styling', 'Color Services', 'Spa Treatments', 'Skin Care', 'Makeup', 'Nail Care'],
        defaultFeatures: ['Expert Stylists', 'Premium Products', 'Relaxing Environment', 'Personalized Service'],
        defaultTestimonials: [
          { name: 'Nicole Turner', text: 'Amazing service! I always leave feeling beautiful and refreshed.', rating: 5 },
          { name: 'Catherine Davis', text: 'The best salon experience. Professional and talented staff.', rating: 5 },
          { name: 'Olivia Martinez', text: 'Love my new look! They really understand what I want.', rating: 5 },
        ],
        defaultStats: [{ value: '15+', label: 'Years' }, { value: '5K+', label: 'Clients' }, { value: '4.9★', label: 'Rating' }, { value: '100%', label: 'Satisfaction' }],
      },
      service: {
        heroTag: 'Professional Services', primaryCTA: 'Get Started', secondaryCTA: 'Learn More',
        servicesTitle: 'What We Offer', featuresTitle: 'Why Choose Us',
        aboutTitle: 'Who We Are', contactTitle: 'Contact Us', testimonialTitle: 'Client Testimonials',
        defaultServices: ['Consultation', 'Project Planning', 'Implementation', 'Ongoing Support', 'Maintenance', 'Training'],
        defaultFeatures: ['Expert Team', 'Quality Guarantee', 'Competitive Pricing', 'Timely Delivery'],
        defaultTestimonials: [
          { name: 'Brian Cooper', text: 'Excellent service from start to finish. Very professional and efficient.', rating: 5 },
          { name: 'Michelle Young', text: 'They exceeded our expectations. Would definitely recommend!', rating: 5 },
          { name: 'Daniel King', text: 'Quality work and great communication throughout the project.', rating: 5 },
        ],
        defaultStats: [{ value: '10+', label: 'Years' }, { value: '500+', label: 'Projects' }, { value: '98%', label: 'Satisfaction' }, { value: '24/7', label: 'Support' }],
      },
      portfolio: {
        heroTag: 'Creative Professional', primaryCTA: 'View Portfolio', secondaryCTA: 'Get In Touch',
        servicesTitle: 'Services', featuresTitle: 'What Sets Me Apart',
        aboutTitle: 'About Me', contactTitle: 'Work Together', testimonialTitle: 'Client Feedback',
        defaultServices: ['Design', 'Development', 'Consulting', 'Branding', 'Strategy', 'Prototyping'],
        defaultFeatures: ['Innovative Approach', 'Attention to Detail', 'Client Collaboration', 'Timely Delivery'],
        defaultTestimonials: [
          { name: 'Alex Foster', text: 'Exceptional work! Creative solutions and professional delivery.', rating: 5 },
          { name: 'Sophia Lewis', text: 'Great to work with. Understood our vision perfectly.', rating: 5 },
          { name: 'Chris Allen', text: 'High-quality work and excellent communication. Recommended!', rating: 5 },
        ],
        defaultStats: [{ value: '50+', label: 'Projects' }, { value: '30+', label: 'Clients' }, { value: '5+', label: 'Years' }, { value: '100%', label: 'Dedication' }],
      },
      realestate: {
        heroTag: 'Find Your Dream Home', primaryCTA: 'Browse Properties', secondaryCTA: 'Schedule Tour',
        servicesTitle: 'Our Services', featuresTitle: 'Why Choose Us',
        aboutTitle: 'About Us', contactTitle: 'Contact Agent', testimonialTitle: 'Client Reviews',
        defaultServices: ['Buying', 'Selling', 'Property Management', 'Market Analysis', 'Home Staging', 'Investment Consulting'],
        defaultFeatures: ['Local Expertise', 'Personalized Service', 'Proven Track Record', 'Negotiation Skills'],
        defaultTestimonials: [
          { name: 'Linda Mitchell', text: 'Found us our dream home! Professional and patient throughout.', rating: 5 },
          { name: 'George Scott', text: 'Excellent agent who really knows the market. Highly recommend!', rating: 5 },
          { name: 'Patricia Adams', text: 'Made selling our home stress-free. Great experience!', rating: 5 },
        ],
        defaultStats: [{ value: '200+', label: 'Properties Sold' }, { value: '15+', label: 'Years' }, { value: '98%', label: 'Satisfaction' }, { value: '$50M+', label: 'Sales' }],
      },
      education: {
        heroTag: 'Learn & Grow', primaryCTA: 'Enroll Now', secondaryCTA: 'View Courses',
        servicesTitle: 'What We Offer', featuresTitle: 'Why Learn With Us',
        aboutTitle: 'About Us', contactTitle: 'Get Started', testimonialTitle: 'Student Success',
        defaultServices: ['Online Courses', 'In-Person Classes', 'Tutoring', 'Group Sessions', 'Exam Preparation', 'Career Counseling'],
        defaultFeatures: ['Expert Instructors', 'Flexible Schedule', 'Interactive Learning', 'Career Support'],
        defaultTestimonials: [
          { name: 'Ashley Bennett', text: 'Excellent instruction and supportive environment. Passed with flying colors!', rating: 5 },
          { name: 'Timothy Clark', text: 'Great learning experience. The instructors are knowledgeable and patient.', rating: 5 },
          { name: 'Karen Wright', text: 'Highly recommend! They really care about student success.', rating: 5 },
        ],
        defaultStats: [{ value: '1K+', label: 'Students' }, { value: '95%', label: 'Success Rate' }, { value: '20+', label: 'Instructors' }, { value: '50+', label: 'Courses' }],
      },
      startup: {
        heroTag: 'Innovation in Action', primaryCTA: 'Get Started', secondaryCTA: 'Learn More',
        servicesTitle: 'Features', featuresTitle: 'What Sets Us Apart',
        aboutTitle: 'Our Mission', contactTitle: 'Get In Touch', testimonialTitle: 'What Users Say',
        defaultServices: ['Product Development', 'Tech Consulting', 'Cloud Solutions', 'Integration', 'Technical Support', 'Custom Dev'],
        defaultFeatures: ['Innovative Technology', 'User-Centric Design', 'Scalable Solutions', 'Expert Support'],
        defaultTestimonials: [
          { name: 'Eric Campbell', text: 'Game-changing product! Exactly what we needed for our business.', rating: 5 },
          { name: 'Maria Garcia', text: 'Innovative solution with excellent support. Highly recommended!', rating: 5 },
          { name: 'Andrew Phillips', text: 'Streamlined our entire workflow. Amazing results!', rating: 5 },
        ],
        defaultStats: [{ value: '10K+', label: 'Users' }, { value: '99.9%', label: 'Uptime' }, { value: '24/7', label: 'Support' }, { value: '4.8★', label: 'Rating' }],
      },
      other: {
        heroTag: 'Welcome', primaryCTA: 'Get Started', secondaryCTA: 'Learn More',
        servicesTitle: 'What We Offer', featuresTitle: 'Why Choose Us',
        aboutTitle: 'About Us', contactTitle: 'Contact Us', testimonialTitle: 'Testimonials',
        defaultServices: ['Consultation', 'Planning', 'Implementation', 'Support', 'Maintenance', 'Training'],
        defaultFeatures: ['Professional Service', 'Quality Results', 'Customer Support', 'Competitive Pricing'],
        defaultTestimonials: [
          { name: 'John Smith', text: 'Excellent service and professional approach. Very satisfied!', rating: 5 },
          { name: 'Mary Johnson', text: 'Quality work delivered on time. Would definitely use again.', rating: 5 },
          { name: 'Robert Brown', text: 'Professional and reliable. Highly recommend their services.', rating: 5 },
        ],
        defaultStats: [{ value: '100+', label: 'Clients' }, { value: '5+', label: 'Years' }, { value: '95%', label: 'Satisfaction' }, { value: '24/7', label: 'Support' }],
      },
    };
    return configs[type] || configs.other;
  }

  // ------------------------------------------------------------------
  //  Section generators (fallback)
  // ------------------------------------------------------------------

  private generateHero(merged: MergedData, config: any): BusinessData['hero'] {
    return {
      headline: decodeHTMLEntities(merged.keyMessages?.[0] || `Welcome to ${merged.name}`),
      subheadline: decodeHTMLEntities(merged.description || `Professional ${merged.businessType} services`),
      cta: { label: merged.callToAction || config.primaryCTA, href: '#contact' },
      secondaryCta: { label: config.secondaryCTA, href: '#about' },
      image: merged.heroImage || undefined,
    };
  }

  private generateNav(merged: MergedData): BusinessData['nav'] {
    const links: { label: string; href: string }[] = [];
    if (merged.aboutContent || merged.description) links.push({ label: 'About', href: '#about' });
    if (merged.features.length > 0) links.push({ label: 'Features', href: '#features' });
    if (merged.products.length > 0 || merged.businessType === 'ecommerce') links.push({ label: 'Shop', href: '#products' });
    if (merged.services.length > 0) links.push({ label: 'Services', href: '#services' });
    if (merged.testimonials.length > 0) links.push({ label: 'Testimonials', href: '#testimonials' });
    links.push({ label: 'Contact', href: '#contact' });
    return { links };
  }

  /** Generate a context-aware service/feature description based on business type and item name. */
  private generateItemDescription(businessType: string, itemName: string, index: number): string {
    const name = itemName.toLowerCase();
    const foodTypes = ['restaurant', 'cafe', 'bakery', 'catering', 'food', 'bistro', 'diner', 'eatery', 'grill', 'pizzeria', 'takeaway'];
    const isFoodBusiness = foodTypes.some(t => businessType.toLowerCase().includes(t));

    if (isFoodBusiness) {
      // Food-specific service descriptions
      const foodMap: Record<string, string> = {
        'dine-in':    'Enjoy a warm, welcoming atmosphere with dishes made fresh to order. Our team is here to make your visit comfortable and memorable.',
        'dine in':    'Enjoy a warm, welcoming atmosphere with dishes made fresh to order. Our team is here to make your visit comfortable and memorable.',
        'takeout':    'Craving great food on the go? Order your favourites for pickup — fresh, hot, and ready exactly when you need it.',
        'take out':   'Craving great food on the go? Order your favourites for pickup — fresh, hot, and ready exactly when you need it.',
        'takeaway':   'Can\'t dine in? No problem. Our takeaway service lets you enjoy your favourite dishes wherever you are.',
        'delivery':   'Restaurant-quality meals delivered straight to your door. We take care of the cooking so you can enjoy every bite at home.',
        'catering':   'Make your next event unforgettable. From intimate dinners to large celebrations, we bring exceptional food and service directly to you.',
        'breakfast':  'Start your day right with our freshly prepared breakfast menu — from hearty cooked plates to lighter bites and great coffee.',
        'lunch':      'Treat yourself to a freshly prepared midday meal. Our lunch menu offers hearty flavours without the wait.',
        'dinner':     'Savour the evening with our carefully crafted dinner menu. Every dish is prepared with premium ingredients and presented with care.',
        'coffee':     'From perfectly pulled espresso to creamy lattes and seasonal specials, our coffee bar is the perfect spot to pause and unwind.',
        'dessert':    'Indulge in our handcrafted desserts — sweet finishes made fresh daily to complement your meal perfectly.',
        'menu':       'Explore a carefully curated selection of dishes made from quality ingredients. There\'s something delicious for everyone.',
      };
      // Try exact or partial match
      for (const [key, desc] of Object.entries(foodMap)) {
        if (name.includes(key)) return desc;
      }
      // Generic food fallback
      const foodFallbacks = [
        `Savour the flavours of our ${itemName} — crafted with care and served with pride.`,
        `Our ${itemName} brings together fresh ingredients and expert preparation for a truly satisfying experience.`,
        `Experience the best of our ${itemName}, made to delight with every bite.`,
        `From the first taste to the last, our ${itemName} is designed to impress.`,
      ];
      return foodFallbacks[index % foodFallbacks.length];
    }

    // Non-food type-specific descriptions
    const typeDescriptions: Record<string, string[]> = {
      fitness:   [
        `Transform your body and mindset with our ${itemName} program, guided by certified coaches.`,
        `Our ${itemName} sessions are designed to challenge, inspire, and get you real results.`,
        `Whether you're a beginner or an athlete, our ${itemName} is tailored to your goals.`,
      ],
      beauty:    [
        `Unwind and be pampered with our premium ${itemName} treatment, tailored entirely to you.`,
        `Our ${itemName} service combines expert technique with quality products for outstanding results.`,
        `Feel refreshed and confident after our signature ${itemName} — because you deserve the best.`,
      ],
      ecommerce: [
        `Discover our curated ${itemName} collection, chosen for quality, style, and lasting value.`,
        `Every ${itemName} we carry is carefully sourced to meet our high standards.`,
        `Shop our ${itemName} range and enjoy quality you can see, feel, and trust.`,
      ],
    };

    const typeList = typeDescriptions[businessType];
    if (typeList) return typeList[index % typeList.length];

    // Final generic fallback — at least avoid "solutions tailored to your needs"
    return `Our ${itemName} service is delivered with expertise, attention to detail, and a commitment to your complete satisfaction.`;
  }

  private generateAbout(merged: MergedData, config: any): BusinessData['about'] {
    const aboutText = merged.aboutContent || merged.description || `${merged.name} is dedicated to providing exceptional ${merged.businessType} services.`;
    return {
      title: config.aboutTitle,
      description: decodeHTMLEntities(aboutText),
      image: merged.galleryImages?.[0] || undefined,
    };
  }

  private generateFeatures(merged: MergedData, config: any): BusinessData['features'] {
    const icons = ['✦', '◈', '▲', '●', '◆', '■'];
    const featureNames = merged.features.length > 0 ? merged.features : config.defaultFeatures;
    const items = featureNames.slice(0, 6).map((f: string, i: number) => ({
      icon: icons[i % icons.length],
      title: f,
      description: merged.uniqueSellingPoints?.[i] || this.generateItemDescription(merged.businessType, f, i),
    }));
    return {
      title: config.featuresTitle,
      subtitle: merged.targetAudience ? `Tailored for ${merged.targetAudience}` : undefined,
      items,
    };
  }

  private generateStats(merged: MergedData): BusinessData['stats'] {
    const config = this.getBusinessTypeConfig(merged.businessType);
    return { items: config.defaultStats };
  }

  private generateServices(merged: MergedData, config: any): BusinessData['services'] {
    // For e-commerce, use features as services (same data) without images
    const isEcommerce = merged.businessType === 'ecommerce';
    
    // For fitness/gym, if products exist (membership packages), incorporate them as services
    const isFitness = merged.businessType === 'fitness';
    
    let serviceNames: string[];
    if (isEcommerce) {
      serviceNames = merged.features.length > 0 ? merged.features : config.defaultFeatures;
    } else if (isFitness && merged.products.length > 0) {
      // Use product names as service/membership options
      serviceNames = merged.products.map(p => p.name);
      console.log('[generateServices] Using products as fitness services/memberships:', serviceNames);
    } else {
      serviceNames = merged.services.length > 0 ? merged.services : config.defaultServices;
    }
    
    const items = serviceNames.slice(0, 6).map((s: string, i: number) => {
      let description: string;
      let price: string | undefined;
      
      if (isFitness && merged.products[i]) {
        // Use product description and price for fitness memberships
        description = merged.products[i].description || `${s} membership with full access to our facilities and programs.`;
        price = merged.products[i].price ? `$${merged.products[i].price}` : undefined;
      } else if (isEcommerce) {
        description = `We provide ${s.toLowerCase()} to ensure the best shopping experience.`;
      } else {
        description = this.generateItemDescription(merged.businessType, s, i);
      }
      
      return {
        title: s,
        description,
        price,
        // Never attach images for e-commerce services
        image: isEcommerce ? undefined : (merged.galleryImages?.[i] || undefined),
      };
    });
    
    return { 
      title: isEcommerce ? 'Why Shop With Us' : config.servicesTitle, 
      subtitle: isEcommerce ? 'Benefits and features of shopping with us' : undefined,
      items 
    };
  }

  private generateProducts(merged: MergedData): BusinessData['products'] | undefined {
    // Service-oriented businesses should NOT show products section
    // Their "products" (membership packages, appointments, etc.) are services
    const serviceBusinessTypes: BusinessType[] = ['fitness', 'healthcare', 'beauty', 'restaurant', 'agency', 'education', 'realestate', 'service', 'portfolio', 'startup'];
    
    if (serviceBusinessTypes.includes(merged.businessType)) {
      console.log(`[generateProducts] Skipping products for ${merged.businessType} business`);
      return undefined;
    }

    // Only generate products section for ecommerce
    if (merged.businessType !== 'ecommerce') {
      return undefined;
    }

    // If we have products from scraping/user input, use them
    if (merged.products.length > 0) {
      const items = merged.products.map((product, i) => ({
        name: product.name,
        description: product.description || undefined,
        price: product.price || undefined,
        salePrice: product.salePrice || undefined,
        image: product.image || merged.galleryImages?.[i] || undefined,
        category: product.category || undefined,
      }));
      
      return {
        title: 'Featured Products',
        subtitle: 'Discover our curated collection',
        items,
      };
    }

    // For ecommerce without products, return undefined (will be empty)
    return undefined;
  }

  private generateTestimonials(merged: MergedData, config: any): BusinessData['testimonials'] {
    const testimonialsData = merged.testimonials.length > 0 ? merged.testimonials : config.defaultTestimonials;
    const items = testimonialsData.map((t: Testimonial) => ({
      quote: t.text,
      author: t.name,
      role: undefined as string | undefined,
    }));
    return { title: config.testimonialTitle, items };
  }

  private generateCta(merged: MergedData, config: any): BusinessData['cta'] {
    return {
      title: config.contactTitle,
      description: `Get in touch with ${merged.name} to discuss how we can help.`,
      buttonLabel: merged.callToAction || config.primaryCTA,
      buttonHref: '#contact',
    };
  }

  private generateFooter(merged: MergedData): BusinessData['footer'] {
    const socials = merged.socialLinks
      ? Object.entries(merged.socialLinks)
          .filter(([, href]) => !!href)
          .map(([platform, href]) => ({ platform, href: href as string }))
      : undefined;
    return {
      description: merged.description || undefined,
      links: [
        { label: 'About', href: '#about' },
        { label: 'Services', href: '#services' },
        { label: 'Contact', href: '#contact' },
      ],
      socials: socials && socials.length > 0 ? socials : undefined,
      copyright: `© ${new Date().getFullYear()} ${merged.name}. All rights reserved.`,
    };
  }
}

export const templateFieldGeneratorService = new TemplateFieldGeneratorService();
