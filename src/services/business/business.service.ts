import { CreateBusinessInput, BusinessWithSite } from '@/types';
import { businessRepository, siteRepository, productRepository } from '@/db/repositories';
import { generateUniqueSlug } from '../scraper/base-scraper.service';
import { contentGeneratorService } from '../ai';
import { prisma } from '@/db/client';
import type { BusinessData } from '@/components/template/types/landing';

/**
 * Business service - handles all business-related operations
 */
export class BusinessService {
  /**
   * Get all businesses for a user
   */
  async getUserBusinesses(userId: string): Promise<BusinessWithSite[]> {
    return await businessRepository.findAllByUser(userId);
  }

  /**
   * Get single business with site
   */
  async getBusinessWithSite(businessId: string, userId: string) {
    return await businessRepository.findByIdWithSite(businessId, userId);
  }

  /**
   * Create a new business with site and products
   */
  async createBusiness(userId: string, userEmail: string, input: CreateBusinessInput) {
    // Generate content using AI
    const content = await contentGeneratorService.generateContent({
      name: input.name,
      description: input.description,
      businessType: input.businessType as any,
      services: input.services,
      features: input.features,
    });

    // Build the complete BusinessData for the new LandingTemplate
    const templateData = this.buildTemplateData(input, content);

    // Use a transaction to create business, site, and products atomically
    const result = await prisma.$transaction(async (tx: any) => {
      // Create business
      const business = await tx.business.create({
        data: {
          userId,
          name: input.name,
          description: input.description,
          sourceUrl: input.sourceUrl,
          logo: input.logo,
          heroImage: input.heroImage,
          galleryImages: input.galleryImages ? JSON.stringify(input.galleryImages) : null,
          primaryColor: input.primaryColor,
          secondaryColor: input.secondaryColor,
          businessType: input.businessType,
          services: JSON.stringify(input.services || content.services),
          phone: input.phone,
          email: input.email || userEmail,
          address: input.address,
          city: input.city,
          calendlyUrl: input.calendlyUrl,
          socialLinks: input.socialLinks ? JSON.stringify(input.socialLinks) : null,
          openingHours: null,
          leadFormFields: input.leadFormFields ? JSON.stringify(input.leadFormFields) : null,
        },
      });

      // Generate unique slug
      const slug = generateUniqueSlug(input.name);

      // Create site with templateData
      const site = await tx.site.create({
        data: {
          businessId: business.id,
          slug,
          headline: content.headline,
          subheadline: content.subheadline,
          aboutText: content.aboutText,
          ctaText: content.ctaText,
          features: JSON.stringify(input.features || content.features),
          testimonials: input.testimonials ? JSON.stringify(input.testimonials) : null,
          metaDescription: content.metaDescription,
          tagline: content.tagline,
          valuePropositions: content.valuePropositions ? JSON.stringify(content.valuePropositions) : null,
          serviceDescriptions: content.serviceDescriptions ? JSON.stringify(content.serviceDescriptions) : null,
          socialMediaBio: content.socialMediaBio,
          templateData: JSON.stringify(templateData),
        },
      });

      // Create products if any
      if (input.products && input.products.length > 0) {
        for (let i = 0; i < input.products.length; i++) {
          const product = input.products[i];
          await tx.product.create({
            data: {
              businessId: business.id,
              name: product.name,
              description: product.description || null,
              price: product.price || null,
              salePrice: product.salePrice || null,
              image: product.image || null,
              category: product.category || null,
              sortOrder: i,
              featured: i < 4,
            },
          });
        }
      }

      return { business, site };
    });

    return {
      businessId: result.business.id,
      siteSlug: result.site.slug,
    };
  }

  /**
   * Build the complete BusinessData object for the LandingTemplate
   */
  private buildTemplateData(
    input: CreateBusinessInput,
    content: any
  ): BusinessData {
    const services = input.services && input.services.length > 0
      ? input.services
      : content.services || [];
    const features = input.features && input.features.length > 0
      ? input.features
      : content.features || [];

    // Build nav links based on available sections
    const navLinks: { label: string; href: string }[] = [];
    if (content.aboutText || input.description) navLinks.push({ label: 'About', href: '#about' });
    if (features.length > 0) navLinks.push({ label: 'Features', href: '#features' });
    if (services.length > 0) navLinks.push({ label: 'Services', href: '#services' });
    if (input.testimonials && input.testimonials.length > 0) navLinks.push({ label: 'Testimonials', href: '#testimonials' });
    navLinks.push({ label: 'Contact', href: '#contact' });

    // Build feature items with icons
    const icons = ['✦', '◈', '▲', '●', '◆', '■'];
    const featureItems = features.map((f: string, i: number) => ({
      icon: icons[i % icons.length],
      title: f,
      description: content.valuePropositions?.[i] || '',
    }));

    // Build service items with descriptions
    const serviceItems = services.map((s: string, i: number) => {
      const desc = Array.isArray(content.serviceDescriptions)
        ? (typeof content.serviceDescriptions[i] === 'string'
            ? content.serviceDescriptions[i]
            : content.serviceDescriptions[i]?.description || '')
        : '';
      return { title: s, description: desc };
    });

    // Build testimonial items
    const testimonialItems = (input.testimonials || []).map((t) => ({
      quote: t.text,
      author: t.name,
      role: undefined as string | undefined,
    }));

    // Build social links for footer
    const socials = input.socialLinks
      ? Object.entries(input.socialLinks)
          .filter(([, href]) => !!href)
          .map(([platform, href]) => ({ platform, href: href as string }))
      : undefined;

    const sectionTitles = content.sectionTitles || {};

    const data: BusinessData = {
      brand: {
        name: input.name,
        logo: input.logo || undefined,
        tagline: content.tagline || input.description || undefined,
      },
      hero: {
        headline: content.headline,
        subheadline: content.subheadline || undefined,
        cta: { label: content.ctaText, href: '#contact' },
        secondaryCta: { label: 'Learn More', href: '#about' },
        image: input.heroImage || undefined,
      },
      nav: { links: navLinks },
      about: (content.aboutText || input.description)
        ? {
            title: sectionTitles.about || 'About Us',
            description: content.aboutText || input.description,
          }
        : undefined,
      features: featureItems.length > 0
        ? {
            title: sectionTitles.services || 'What Sets Us Apart',
            items: featureItems,
          }
        : undefined,
      services: serviceItems.length > 0
        ? {
            title: sectionTitles.products || 'Our Services',
            items: serviceItems,
          }
        : undefined,
      testimonials: testimonialItems.length > 0
        ? {
            title: sectionTitles.testimonials || 'What Our Clients Say',
            items: testimonialItems,
          }
        : undefined,
      cta: {
        title: sectionTitles.contact || 'Ready to get started?',
        description: `Get in touch with ${input.name} today.`,
        buttonLabel: content.ctaText,
        buttonHref: '#contact',
      },
      footer: {
        description: input.description || undefined,
        links: navLinks,
        socials: socials && socials.length > 0 ? socials : undefined,
        copyright: `© ${new Date().getFullYear()} ${input.name}. All rights reserved.`,
      },
    };

    return data;
  }

  /**
   * Update business
   */
  async updateBusiness(
    businessId: string,
    userId: string,
    input: Partial<CreateBusinessInput>
  ): Promise<void> {
    // Verify ownership
    const business = await businessRepository.findByIdAndUser(businessId, userId);
    if (!business) {
      throw new Error('Business not found');
    }

    await businessRepository.update(businessId, {
      name: input.name,
      description: input.description,
      logo: input.logo,
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      services: input.services ? JSON.stringify(input.services) : undefined,
      phone: input.phone,
      email: input.email,
      address: input.address,
      city: input.city,
      calendlyUrl: input.calendlyUrl,
    } as any);
  }

  /**
   * Delete business
   */
  async deleteBusiness(businessId: string, userId: string): Promise<void> {
    // Verify ownership
    const business = await businessRepository.findByIdAndUser(businessId, userId);
    if (!business) {
      throw new Error('Business not found');
    }

    await businessRepository.delete(businessId);
  }
}

export const businessService = new BusinessService();
