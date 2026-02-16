import { CreateBusinessInput, BusinessWithSite } from '@/types';
import { businessRepository, siteRepository, productRepository } from '@/db/repositories';
import { generateUniqueSlug } from '../scraper/base-scraper.service';
import { contentGeneratorService } from '../ai';
import { prisma } from '@/db/client';

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

      // Create site
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
