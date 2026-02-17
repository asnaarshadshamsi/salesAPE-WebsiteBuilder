/**
 * Business Service
 *
 * Handles business CRUD operations and website generation.
 *
 * Key creation flow:
 *  1. If sourceUrl → re-scrape with enhanced scraper for rawText + images
 *  2. Build MergedData from user input + scraped data
 *  3. Call templateFieldGeneratorService.generateWithLLM() to produce BusinessData
 *  4. Overlay scraped images (logo → brand, hero → hero, gallery → services)
 *  5. Store complete BusinessData JSON in site.templateData
 *  6. Site page renders from that JSON via LandingTemplate
 */

import { CreateBusinessInput, BusinessWithSite, BusinessType } from '@/types';
import { businessRepository, siteRepository, productRepository } from '@/db/repositories';
import { generateUniqueSlug } from '../scraper/base-scraper.service';
import { contentGeneratorService } from '../ai';
import { templateFieldGeneratorService, type MergedData } from '../ai/template-field-generator.service';
import { enhancedScraperService, type EnhancedScrapedData } from '../scraper/enhanced-scraper.service';
import { prisma } from '@/db/client';
import type { BusinessData } from '@/components/template/types/landing';

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
   * Create a new business with site and products.
   *
   * This is the end-to-end pipeline:
   *  sourceUrl → enhanced scraper → LLM → BusinessData → DB → rendered page
   */
  async createBusiness(userId: string, userEmail: string, input: CreateBusinessInput) {
    // ---------------------------------------------------------------
    // Step 1: If URL provided, scrape site for full context
    // ---------------------------------------------------------------
    let scrapedData: EnhancedScrapedData | null = null;
    if (input.sourceUrl) {
      try {
        console.log('[BusinessService] Scraping source URL for LLM context…');
        scrapedData = await enhancedScraperService.scrapeWebsite(input.sourceUrl);
        console.log(`[BusinessService] Scrape done — confidence: ${scrapedData.confidence}, images: ${scrapedData.scrapedImages.length}`);
      } catch (err) {
        console.error('[BusinessService] Scraping failed, continuing without:', err);
      }
    }

    // ---------------------------------------------------------------
    // Step 2: Generate baseline AI content (template fallback)
    // ---------------------------------------------------------------
    const content = await contentGeneratorService.generateContent({
      name: input.name,
      description: input.description,
      businessType: input.businessType as BusinessType,
      services: input.services,
      features: input.features,
    });

    // ---------------------------------------------------------------
    // Step 3: Build complete BusinessData via LLM + scraped data
    // ---------------------------------------------------------------
    const templateData = await this.buildTemplateData(input, content, scrapedData);
    console.log('[BusinessService] BusinessData generated. Sections:', Object.keys(templateData).filter(k => !!(templateData as any)[k]).join(', '));

    // ---------------------------------------------------------------
    // Step 4: Persist everything in a transaction
    // ---------------------------------------------------------------
    const result = await prisma.$transaction(async (tx: any) => {
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

      const slug = generateUniqueSlug(input.name);

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

  // ==================================================================
  //  Build BusinessData — attempts LLM, falls back to structural
  // ==================================================================

  private async buildTemplateData(
    input: CreateBusinessInput,
    content: any,
    scrapedData: EnhancedScrapedData | null
  ): Promise<BusinessData> {
    const services =
      input.services && input.services.length > 0
        ? input.services
        : content.services || [];
    const features =
      input.features && input.features.length > 0
        ? input.features
        : content.features || [];

    // Build MergedData for the template field generator
    const merged: MergedData = {
      name: input.name,
      description: input.description || content.aboutText || '',
      logo: input.logo,
      heroImage: input.heroImage,
      galleryImages: input.galleryImages || scrapedData?.galleryImages || [],
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      businessType: input.businessType as BusinessType,
      services,
      features,
      products: input.products || [],
      phone: input.phone,
      email: input.email,
      address: input.address,
      city: input.city,
      socialLinks: input.socialLinks || scrapedData?.socialLinks || {},
      testimonials: input.testimonials || scrapedData?.testimonials || [],
      aboutContent: scrapedData?.aboutContent || content.aboutText || input.description || '',
      confidence: scrapedData?.confidence || ('low' as const),
      // LLM context from scraper
      rawText: scrapedData?.rawText || '',
      scrapedImages: scrapedData?.scrapedImages || [],
      // Extra hints
      uniqueSellingPoints: content.valuePropositions || [],
      keyMessages: content.headline ? [content.headline] : [],
      callToAction: content.ctaText,
      targetAudience: undefined,
      tone: undefined,
    };

    // Use LLM-powered generation (falls back to structural assembly internally)
    return await templateFieldGeneratorService.generateWithLLM(merged);
  }

  // ==================================================================
  //  Update / Delete
  // ==================================================================

  async updateBusiness(
    businessId: string,
    userId: string,
    input: Partial<CreateBusinessInput>
  ): Promise<void> {
    const business = await businessRepository.findByIdAndUser(businessId, userId);
    if (!business) throw new Error('Business not found');

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

  async deleteBusiness(businessId: string, userId: string): Promise<void> {
    const business = await businessRepository.findByIdAndUser(businessId, userId);
    if (!business) throw new Error('Business not found');
    await businessRepository.delete(businessId);
  }
}

export const businessService = new BusinessService();
