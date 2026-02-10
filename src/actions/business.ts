"use server";

import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { scrapeWebsite, generateUniqueSlug, type ScrapedData, type ProductData } from "@/lib/production-scraper";
import { generateContent, generateEnhancedContent, isCohereConfigured, type BusinessType } from "@/lib/ai";
import { revalidatePath } from "next/cache";

// Define types locally to avoid Prisma import issues
type Business = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  sourceUrl: string | null;
  logo: string | null;
  heroImage: string | null;
  primaryColor: string;
  secondaryColor: string;
  businessType: string;
  services: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  calendlyUrl: string | null;
  socialLinks: string | null;
  openingHours: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Site = {
  id: string;
  businessId: string;
  slug: string;
  headline: string;
  subheadline: string | null;
  aboutText: string | null;
  ctaText: string;
  features: string | null;
  testimonials: string | null;
  isPublished: boolean;
  heroVariant: string;
  viewsA: number;
  viewsB: number;
  conversionsA: number;
  conversionsB: number;
  createdAt: Date;
  updatedAt: Date;
};

// Type for business with site and lead count
export type BusinessWithSite = Business & {
  site: (Site & {
    _count: {
      leads: number;
    };
  }) | null;
};

export interface AnalyzeResult {
  success: boolean;
  data?: {
    name: string;
    description: string;
    logo: string | null;
    heroImage: string | null;
    primaryColor: string;
    secondaryColor: string;
    businessType: BusinessType;
    services: string[];
    features: string[];
    products: ProductData[];
    phone: string | null;
    email: string | null;
    address: string | null;
    socialLinks: ScrapedData['socialLinks'];
    testimonials: ScrapedData['testimonials'];
    galleryImages: string[];
    sourceUrl: string;
  };
  error?: string;
}

export async function analyzeUrl(url: string): Promise<AnalyzeResult> {
  try {
    if (!url || url.trim().length === 0) {
      return { success: false, error: "Please enter a URL" };
    }

    // Scrape the website for comprehensive data
    const scraped = await scrapeWebsite(url);
    
    // Generate business-type-specific content (try AI-enhanced first)
    let content;
    try {
      if (isCohereConfigured()) {
        content = await generateEnhancedContent({
          name: scraped.title,
          description: scraped.description,
          businessType: scraped.businessType,
          services: scraped.services,
          features: scraped.features,
        });
      } else {
        content = generateContent({
          name: scraped.title,
          description: scraped.description,
          businessType: scraped.businessType,
          services: scraped.services,
          features: scraped.features,
        });
      }
    } catch (error) {
      console.error('Error generating AI content, using templates:', error);
      content = generateContent({
        name: scraped.title,
        description: scraped.description,
        businessType: scraped.businessType,
        services: scraped.services,
        features: scraped.features,
      });
    }

    return {
      success: true,
      data: {
        name: scraped.title,
        description: scraped.description || content.aboutText,
        logo: scraped.logo,
        heroImage: scraped.heroImage,
        primaryColor: scraped.primaryColor,
        secondaryColor: scraped.secondaryColor,
        businessType: scraped.businessType,
        services: scraped.services.length > 0 ? scraped.services : content.services,
        features: scraped.features.length > 0 ? scraped.features : content.features,
        products: scraped.products,
        phone: scraped.phone,
        email: scraped.email,
        address: scraped.address,
        socialLinks: scraped.socialLinks,
        testimonials: scraped.testimonials,
        galleryImages: scraped.galleryImages,
        sourceUrl: url,
      },
    };
  } catch (error) {
    console.error("Error analyzing URL:", error);
    return { success: false, error: "Failed to analyze URL. Please try again." };
  }
}

export interface CreateBusinessInput {
  name: string;
  description?: string;
  sourceUrl?: string;
  logo?: string;
  heroImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  businessType?: BusinessType;
  services?: string[];
  features?: string[];
  products?: ProductData[];
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  calendlyUrl?: string;
  socialLinks?: ScrapedData['socialLinks'];
  testimonials?: ScrapedData['testimonials'];
  leadFormFields?: { id: string; label: string; type: string; required: boolean; options?: string[] }[];
  connectCalendar?: boolean;
}

export interface CreateBusinessResult {
  success: boolean;
  businessId?: string;
  siteSlug?: string;
  error?: string;
}

export async function createBusiness(
  input: CreateBusinessInput
): Promise<CreateBusinessResult> {
  try {
    const user = await requireAuth();
    
    const businessType = input.businessType || 'service';

    // Generate content for the site (try AI-enhanced first)
    let content;
    try {
      if (isCohereConfigured()) {
        content = await generateEnhancedContent({
          name: input.name,
          description: input.description,
          businessType,
          services: input.services,
          features: input.features,
          city: input.city,
          products: input.products,
        });
        console.log('Generated AI-enhanced content for site');
      } else {
        content = generateContent({
          name: input.name,
          description: input.description,
          businessType,
          services: input.services,
          features: input.features,
          city: input.city,
        });
      }
    } catch (error) {
      console.error('Error generating AI content, using templates:', error);
      content = generateContent({
        name: input.name,
        description: input.description,
        businessType,
        services: input.services,
        features: input.features,
        city: input.city,
      });
    }

    // Create business with site in a transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      // Create business
      const business = await tx.business.create({
        data: {
          userId: user.id,
          name: input.name,
          description: input.description || content.aboutText,
          sourceUrl: input.sourceUrl,
          logo: input.logo,
          heroImage: input.heroImage,
          primaryColor: input.primaryColor || "#ec4899",
          secondaryColor: input.secondaryColor || "#f472b6",
          businessType,
          services: JSON.stringify(input.services || content.services),
          phone: input.phone,
          email: input.email || user.email,
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

      // Prepare enhanced site data with AI-generated metadata
      const siteData: Record<string, unknown> = {
        businessId: business.id,
        slug,
        headline: content.headline,
        subheadline: content.subheadline,
        aboutText: content.aboutText,
        ctaText: content.ctaText,
        features: JSON.stringify(input.features || content.features),
        testimonials: input.testimonials ? JSON.stringify(input.testimonials) : null,
      };

      // Add AI-enhanced metadata if available
      if (content.metaDescription) {
        siteData.metaDescription = content.metaDescription;
      }
      if (content.tagline) {
        siteData.tagline = content.tagline;
      }
      if (content.valuePropositions && content.valuePropositions.length > 0) {
        siteData.valuePropositions = JSON.stringify(content.valuePropositions);
      }
      if (content.serviceDescriptions && content.serviceDescriptions.length > 0) {
        siteData.serviceDescriptions = JSON.stringify(content.serviceDescriptions);
      }
      if (content.socialMediaBio) {
        siteData.socialMediaBio = content.socialMediaBio;
      }

      // Create site
      const site = await tx.site.create({
        data: siteData,
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
              featured: i < 4, // First 4 products are featured
            },
          });
        }
      }

      return { business, site };
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      businessId: result.business.id,
      siteSlug: result.site.slug,
    };
  } catch (error) {
    console.error("Error creating business:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please sign in to continue" };
    }
    return { success: false, error: "Failed to create business" };
  }
}

export async function updateBusiness(
  businessId: string,
  input: Partial<CreateBusinessInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();

    // Verify ownership
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: user.id },
      include: { site: true },
    });

    if (!business) {
      return { success: false, error: "Business not found" };
    }

    await prisma.business.update({
      where: { id: businessId },
      data: {
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
      },
    });

    revalidatePath("/dashboard");
    if (business.site?.slug) {
      revalidatePath(`/sites/${business.site.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating business:", error);
    return { success: false, error: "Failed to update business" };
  }
}

export async function deleteBusiness(
  businessId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();

    // Verify ownership
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: user.id },
    });

    if (!business) {
      return { success: false, error: "Business not found" };
    }

    await prisma.business.delete({
      where: { id: businessId },
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting business:", error);
    return { success: false, error: "Failed to delete business" };
  }
}

export async function getUserBusinesses() {
  try {
    const user = await requireAuth();

    const businesses = await prisma.business.findMany({
      where: { userId: user.id },
      include: {
        site: {
          include: {
            _count: {
              select: { leads: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return businesses;
  } catch {
    return [];
  }
}
