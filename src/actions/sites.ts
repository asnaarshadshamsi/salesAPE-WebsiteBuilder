"use server";

import { requireAuth } from "@/lib/auth";
import { siteRepository, businessRepository } from "@/db/repositories";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function updateSiteData(
  siteId: string,
  updateData: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    
    // Get the site to verify ownership
    const site = await siteRepository.findByIdWithBusiness(siteId);
    if (!site || site.business.userId !== user.id) {
      return { success: false, error: "Site not found or access denied" };
    }

    // Update site data
    await siteRepository.update(siteId, {
      headline: updateData.headline,
      subheadline: updateData.subheadline,
      aboutText: updateData.aboutText,
      ctaText: updateData.ctaText,
      features: updateData.features ? JSON.stringify(updateData.features) : undefined,
      testimonials: updateData.testimonials ? JSON.stringify(updateData.testimonials) : undefined,
      serviceDescriptions: updateData.serviceDescriptions ? JSON.stringify(updateData.serviceDescriptions) : undefined,
      // Store custom editor data in templateData field
      templateData: updateData.editorData ? JSON.stringify(updateData.editorData) : undefined,
    });

    revalidatePath(`/sites/${site.slug}`);
    revalidatePath(`/editor/${site.slug}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error updating site data:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update site" 
    };
  }
}

/**
 * Comprehensive save for the new site editor.
 * Handles both scraper sites (saved to templateData) and AI chatbot sites (saved to flat fields + business).
 */
export async function saveSiteEditorChanges(
  siteId: string,
  changes: {
    // For scraper sites – the full BusinessData JSON
    templateData?: Record<string, any>;
    // For AI chatbot sites – flat site fields
    headline?: string;
    subheadline?: string;
    aboutText?: string;
    ctaText?: string;
    features?: string[];
    testimonials?: any[];
    serviceDescriptions?: any[];
    // Business fields (both types)
    businessName?: string;
    businessDescription?: string;
    businessPhone?: string;
    businessEmail?: string;
    businessAddress?: string;
    businessCity?: string;
    businessServices?: string[];
    businessPrimaryColor?: string;
    businessSecondaryColor?: string;
    businessHeroImage?: string;
    businessLogo?: string;
    businessGalleryImages?: string[];
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();

    const site = await siteRepository.findByIdWithBusiness(siteId);
    if (!site || site.business.userId !== user.id) {
      return { success: false, error: "Site not found or access denied" };
    }

    // ── 1. Update site record ─────────────────────────────────────────────
    const siteUpdatePayload: Record<string, any> = {};

    if (changes.templateData !== undefined) {
      siteUpdatePayload.templateData = JSON.stringify(changes.templateData);
    }
    if (changes.headline !== undefined) siteUpdatePayload.headline = changes.headline;
    if (changes.subheadline !== undefined) siteUpdatePayload.subheadline = changes.subheadline;
    if (changes.aboutText !== undefined) siteUpdatePayload.aboutText = changes.aboutText;
    if (changes.ctaText !== undefined) siteUpdatePayload.ctaText = changes.ctaText;
    if (changes.features !== undefined) siteUpdatePayload.features = JSON.stringify(changes.features);
    if (changes.testimonials !== undefined) siteUpdatePayload.testimonials = JSON.stringify(changes.testimonials);
    if (changes.serviceDescriptions !== undefined) siteUpdatePayload.serviceDescriptions = JSON.stringify(changes.serviceDescriptions);

    if (Object.keys(siteUpdatePayload).length > 0) {
      await prisma.site.update({ where: { id: siteId }, data: siteUpdatePayload });
    }

    // ── 2. Update business record ─────────────────────────────────────────
    const bizUpdatePayload: Record<string, any> = {};

    if (changes.businessName !== undefined) bizUpdatePayload.name = changes.businessName;
    if (changes.businessDescription !== undefined) bizUpdatePayload.description = changes.businessDescription;
    if (changes.businessPhone !== undefined) bizUpdatePayload.phone = changes.businessPhone;
    if (changes.businessEmail !== undefined) bizUpdatePayload.email = changes.businessEmail;
    if (changes.businessAddress !== undefined) bizUpdatePayload.address = changes.businessAddress;
    if (changes.businessCity !== undefined) bizUpdatePayload.city = changes.businessCity;
    if (changes.businessServices !== undefined) bizUpdatePayload.services = JSON.stringify(changes.businessServices);
    if (changes.businessPrimaryColor !== undefined) bizUpdatePayload.primaryColor = changes.businessPrimaryColor;
    if (changes.businessSecondaryColor !== undefined) bizUpdatePayload.secondaryColor = changes.businessSecondaryColor;
    if (changes.businessHeroImage !== undefined) bizUpdatePayload.heroImage = changes.businessHeroImage;
    if (changes.businessLogo !== undefined) bizUpdatePayload.logo = changes.businessLogo;
    if (changes.businessGalleryImages !== undefined) bizUpdatePayload.galleryImages = JSON.stringify(changes.businessGalleryImages);

    if (Object.keys(bizUpdatePayload).length > 0) {
      await prisma.business.update({ where: { id: site.businessId }, data: bizUpdatePayload });
    }

    revalidatePath(`/sites/${site.slug}`);
    revalidatePath(`/editor/${site.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Error saving site editor changes:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save changes",
    };
  }
}

// Business types that use the dedicated Ecommerce template (mirrors sites/[slug]/page.tsx)
const ECOMMERCE_TYPES = new Set([
  'ecommerce','perfume','jewelry','flowershop','beauty','spa',
  'barbershop','photography','petcare','events',
]);
const FOOD_TYPES = new Set([
  'restaurant','cafe','bakery','catering',
]);

function pickTemplateKind(businessType: string): 'ecommerce' | 'food' | 'landing' | 'chatbot' {
  if (ECOMMERCE_TYPES.has(businessType)) return 'ecommerce';
  if (FOOD_TYPES.has(businessType)) return 'food';
  return 'landing';
}

export async function getSiteForEditor(
  slug: string
): Promise<{ success: boolean; site?: any; business?: any; error?: string }> {
  try {
    const user = await requireAuth();
    
    const site = await siteRepository.findBySlugWithBusiness(slug);
    if (!site || site.business.userId !== user.id) {
      return { success: false, error: "Site not found or access denied" };
    }

    const isScraperSite = !!(site.business.sourceUrl && site.business.sourceUrl.trim());
    const hasTemplateData = !!(site.templateData && site.templateData.trim());

    // Parse templateData for scraper sites
    let businessData: any = null;
    if (isScraperSite && hasTemplateData) {
      try {
        businessData = JSON.parse(site.templateData as string);
      } catch {
        // ignore
      }
    }

    const templateKind = isScraperSite
      ? pickTemplateKind(site.business.businessType)
      : 'chatbot';

    return {
      success: true,
      site: {
        id: site.id,
        slug: site.slug,
        headline: site.headline,
        subheadline: site.subheadline,
        aboutText: site.aboutText,
        ctaText: site.ctaText,
        features: site.features ? JSON.parse(site.features as string) : [],
        testimonials: site.testimonials ? JSON.parse(site.testimonials as string) : [],
        serviceDescriptions: site.serviceDescriptions ? JSON.parse(site.serviceDescriptions as string) : [],
        isScraperSite,
        hasTemplateData,
        templateKind,
        businessData, // parsed BusinessData for scraper sites
      },
      business: {
        id: site.business.id,
        name: site.business.name,
        description: site.business.description,
        sourceUrl: site.business.sourceUrl,
        logo: site.business.logo,
        heroImage: site.business.heroImage,
        galleryImages: site.business.galleryImages ? JSON.parse(site.business.galleryImages as string) : [],
        primaryColor: site.business.primaryColor,
        secondaryColor: site.business.secondaryColor,
        businessType: site.business.businessType,
        services: site.business.services ? JSON.parse(site.business.services as string) : [],
        phone: site.business.phone,
        email: site.business.email,
        address: site.business.address,
        city: site.business.city,
        calendlyUrl: site.business.calendlyUrl,
      }
    };
  } catch (error) {
    console.error("Error getting site for editor:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to get site" 
    };
  }
}
