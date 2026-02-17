"use server";

import { requireAuth } from "@/lib/auth";
import { businessService, businessAnalyzerService, voiceAnalyzerService } from "@/services/business";
import { revalidatePath } from "next/cache";
import { CreateBusinessInput, BusinessWithSite } from "@/types";

export type { BusinessWithSite } from "@/types";

// ==================== ANALYZE URL ====================

export interface AnalyzeResult {
  success: boolean;
  data?: {
    name: string;
    description: string;
    logo: string | null;
    heroImage: string | null;
    primaryColor: string;
    secondaryColor: string;
    businessType: string;
    services: string[];
    features: string[];
    products: any[];
    phone: string | null;
    email: string | null;
    address: string | null;
    socialLinks: any;
    testimonials: any[];
    galleryImages: string[];
    sourceUrl: string;
    // Enhanced data from multi-page scraper
    aboutContent?: string;
    confidence?: string;
  };
  error?: string;
}

export async function analyzeUrl(url: string): Promise<AnalyzeResult> {
  try {
    const data = await businessAnalyzerService.analyzeUrl(url);
    return { success: true, data };
  } catch (error) {
    console.error("Error analyzing URL:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to analyze URL. Please try again." 
    };
  }
}

// ==================== ANALYZE VOICE INPUT ====================

export interface VoiceAnalyzeResult {
  success: boolean;
  data?: {
    name: string;
    description: string;
    businessType: string;
    services: string[];
    features: string[];
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    primaryColor: string;
    secondaryColor: string;
    targetAudience: string | null;
    uniqueSellingPoints: string[];
  };
  error?: string;
}

export async function analyzeVoiceInput(voiceTranscript: string): Promise<VoiceAnalyzeResult> {
  try {
    const data = await voiceAnalyzerService.analyzeVoiceInput(voiceTranscript);
    return { success: true, data };
  } catch (error) {
    console.error("Error analyzing voice input:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to analyze voice input." 
    };
  }
}

// ==================== CREATE BUSINESS ====================

export async function createBusiness(
  input: CreateBusinessInput
): Promise<{ success: boolean; businessId?: string; siteSlug?: string; error?: string }> {
  try {
    const user = await requireAuth();
    const result = await businessService.createBusiness(user.id, user.email || '', input);
    
    revalidatePath("/dashboard");
    
    return {
      success: true,
      businessId: result.businessId,
      siteSlug: result.siteSlug,
    };
  } catch (error) {
    console.error("Error creating business:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "Please sign in to continue" };
    }
    return { success: false, error: "Failed to create business" };
  }
}

// ==================== UPDATE BUSINESS ====================

export async function updateBusiness(
  businessId: string,
  input: Partial<CreateBusinessInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    await businessService.updateBusiness(businessId, user.id, input);
    
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/business/${businessId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error updating business:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update business" 
    };
  }
}

// ==================== DELETE BUSINESS ====================

export async function deleteBusiness(
  businessId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    await businessService.deleteBusiness(businessId, user.id);
    
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting business:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete business" 
    };
  }
}

// ==================== GET USER BUSINESSES ====================

export async function getUserBusinesses(): Promise<BusinessWithSite[]> {
  try {
    const user = await requireAuth();
    return await businessService.getUserBusinesses(user.id);
  } catch {
    return [];
  }
}
