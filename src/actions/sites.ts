"use server";

import { requireAuth } from "@/lib/auth";
import { siteRepository } from "@/db/repositories";
import { revalidatePath } from "next/cache";

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

export async function getSiteForEditor(
  slug: string
): Promise<{ success: boolean; site?: any; business?: any; error?: string }> {
  try {
    const user = await requireAuth();
    
    const site = await siteRepository.findBySlugWithBusiness(slug);
    if (!site || site.business.userId !== user.id) {
      return { success: false, error: "Site not found or access denied" };
    }

    return {
      success: true,
      site: {
        id: site.id,
        slug: site.slug,
        headline: site.headline,
        subheadline: site.subheadline,
        aboutText: site.aboutText,
        ctaText: site.ctaText,
        features: site.features ? JSON.parse(site.features) : [],
        testimonials: site.testimonials ? JSON.parse(site.testimonials) : [],
        serviceDescriptions: site.serviceDescriptions ? JSON.parse(site.serviceDescriptions) : [],
        editorData: site.templateData ? JSON.parse(site.templateData) : null,
      },
      business: {
        id: site.business.id,
        name: site.business.name,
        description: site.business.description,
        logo: site.business.logo,
        heroImage: site.business.heroImage,
        galleryImages: site.business.galleryImages ? JSON.parse(site.business.galleryImages) : [],
        primaryColor: site.business.primaryColor,
        secondaryColor: site.business.secondaryColor,
        businessType: site.business.businessType,
        services: site.business.services ? JSON.parse(site.business.services) : [],
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
