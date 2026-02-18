/**
 * Layout Composer Engine
 * Dynamically composes website layouts based on business type and brand tone
 */

import type { DesignSystem } from '@/services/ai/design-system-generator.service';
import type { BrandAnalysis } from '@/services/ai/brand-analyzer.service';
import type { ScrapedData } from '@/types/scraper';

export type SectionType =
  | 'hero-split'
  | 'hero-centered'
  | 'hero-overlay'
  | 'product-grid'
  | 'product-luxury'
  | 'product-masonry'
  | 'service-icon-grid'
  | 'service-cards'
  | 'gallery'
  | 'testimonials'
  | 'cta'
  | 'newsletter'
  | 'faq'
  | 'contact';

export type HeroVariant = 'hero-centered' | 'hero-overlay' | 'hero-split';
export type ProductVariant = 'product-grid' | 'product-luxury' | 'product-masonry';
export type ServiceVariant = 'service-icon-grid' | 'service-cards';

export interface ComposedLayout {
  sections: SectionConfig[];
  designSystem: DesignSystem;
  brandAnalysis: BrandAnalysis;
}

export interface SectionConfig {
  type: SectionType;
  variant?: string;
  data: Record<string, any>;
  order: number;
}

/**
 * Select hero variant based on brand tone and available assets
 */
function selectHeroVariant(
  tone: string,
  hasBackgroundImage: boolean,
  hasLogo: boolean
): HeroVariant {
  if (tone === 'luxury' && hasBackgroundImage) return 'hero-split';
  if (tone === 'minimal' && hasLogo) return 'hero-split';
  if (tone === 'bold') return 'hero-overlay';
  if (tone === 'playful') return 'hero-centered';
  if (hasBackgroundImage) return 'hero-split';
  return 'hero-centered';
}

/**
 * Select product layout variant based on business type and product count
 */
function selectProductVariant(
  businessType: string,
  productCount: number,
  tone: string
): ProductVariant {
  if (tone === 'luxury' && productCount >= 12) return 'product-luxury';
  if (productCount > 20) return 'product-masonry';
  if (businessType.includes('restaurant')) return 'product-grid';
  if (productCount >= 9) return 'product-grid';
  return 'product-grid';
}

/**
 * Select service layout variant based on business type
 */
function selectServiceVariant(businessType: string, serviceCount: number): ServiceVariant {
  if (businessType.includes('consulting') || businessType.includes('agency')) {
    return 'service-cards';
  }
  if (serviceCount > 6) return 'service-cards';
  return 'service-icon-grid';
}

/**
 * Determine section order intelligently
 */
function determineSectionOrder(
  businessType: string,
  tone: string,
  hasProducts: boolean,
  hasServices: boolean,
  hasTestimonials: boolean
): SectionType[] {
  const sections: SectionType[] = [];

  // Hero is always first
  // Note: Hero variant is determined separately by selectHeroVariant
  
  // Add products for e-commerce
  if (hasProducts) {
    sections.push('product-grid');
  }

  // Add services
  if (hasServices) {
    sections.push('service-icon-grid');
  }

  // Add testimonials before CTA for credibility
  if (hasTestimonials) {
    sections.push('testimonials');
  }

  // Add gallery for visual businesses
  if (businessType.includes('design') || businessType.includes('studio')) {
    sections.push('gallery');
  }

  // Add FAQ for service businesses
  if (hasServices && !hasProducts) {
    sections.push('faq');
  }

  // Add CTA
  sections.push('cta');

  // Add newsletter/contact
  sections.push('newsletter');
  sections.push('contact');

  return sections;
}

/**
 * Compose layout dynamically
 */
export function composeLayout(
  scrapedData: ScrapedData,
  brandAnalysis: BrandAnalysis,
  designSystem: DesignSystem
): ComposedLayout {
  const { tone } = brandAnalysis;
  const businessType = scrapedData.businessType.toLowerCase();

  const heroVariant = selectHeroVariant(tone, !!scrapedData.heroImage, !!scrapedData.logo);
  const productVariant = selectProductVariant(
    businessType,
    scrapedData.products.length,
    tone
  );
  const serviceVariant = selectServiceVariant(businessType, scrapedData.services.length);

  const sectionOrder = determineSectionOrder(
    businessType,
    tone,
    scrapedData.products.length > 0,
    scrapedData.services.length > 0,
    scrapedData.testimonials.length > 0
  );

  const sections: SectionConfig[] = [
    // Hero section is always first
    {
      type: heroVariant, // Use the specific hero variant as the type
      data: {
        headline: scrapedData.title,
        subheadline: scrapedData.description,
        cta: 'Get Started',
        backgroundImage: scrapedData.heroImage,
        logo: scrapedData.logo,
      },
      order: 0,
    },
  ];

  // Add other sections based on sectionOrder
  sectionOrder.forEach((type, index) => {
    switch (type) {
      case 'product-grid':
      case 'product-luxury':
      case 'product-masonry':
        sections.push({
          type: productVariant, // Use the selected product variant
          data: {
            products: scrapedData.products,
            title: 'Our Products',
          },
          order: index + 1,
        });
        break;

      case 'service-icon-grid':
      case 'service-cards':
        sections.push({
          type: serviceVariant, // Use the selected service variant
          data: {
            services: scrapedData.services,
            title: 'Our Services',
            descriptions: scrapedData.services.map((s) => ({
              name: s,
              description: `Professional ${s} services`,
            })),
          },
          order: index + 1,
        });
        break;

      case 'testimonials':
        sections.push({
          type,
          data: {
            testimonials: scrapedData.testimonials,
            title: 'What Our Clients Say',
          },
          order: index + 1,
        });
        break;

      case 'gallery':
        sections.push({
          type,
          data: {
            images: scrapedData.galleryImages,
            title: 'Gallery',
          },
          order: index + 1,
        });
        break;

      case 'cta':
        sections.push({
          type,
          data: {
            headline: `Ready to work with ${scrapedData.title}?`,
            subheadline: 'Get in touch today',
            buttonText: 'Contact Us',
          },
          order: index + 1,
        });
        break;

      case 'newsletter':
        sections.push({
          type,
          data: {
            title: 'Stay Updated',
            subtitle: 'Subscribe to our newsletter',
          },
          order: index + 1,
        });
        break;

      case 'contact':
        sections.push({
          type,
          data: {
            email: scrapedData.email,
            phone: scrapedData.phone,
            address: scrapedData.address,
            socialLinks: scrapedData.socialLinks,
          },
          order: index + 1,
        });
        break;

      case 'faq':
        sections.push({
          type,
          data: {
            faqs: [
              { question: 'What services do you offer?', answer: scrapedData.services.join(', ') },
              { question: 'How can I contact you?', answer: `Email: ${scrapedData.email} | Phone: ${scrapedData.phone}` },
            ],
          },
          order: index + 1,
        });
        break;
    }
  });

  return {
    sections,
    designSystem,
    brandAnalysis,
  };
}

export const layoutComposerService = {
  composeLayout,
  selectHeroVariant,
  selectProductVariant,
  selectServiceVariant,
  determineSectionOrder,
};
