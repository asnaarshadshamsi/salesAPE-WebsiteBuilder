"use server";

import { requireAuth } from "@/lib/auth";
import { leadService } from "@/services/lead";
import { siteRepository } from "@/db/repositories";
import { revalidatePath } from "next/cache";
import { CreateLeadInput, LeadStatus } from "@/types";

// ==================== CREATE LEAD ====================

export async function createLead(
  input: CreateLeadInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await leadService.createLead(input);
    
    // Get site to revalidate paths
    const site = await siteRepository.findById(input.siteId);
    if (site) {
      revalidatePath(`/sites/${site.slug}`);
      revalidatePath("/dashboard/leads");
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error creating lead:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create lead" 
    };
  }
}

// ==================== GET USER LEADS ====================

export async function getUserLeads(filters?: { status?: LeadStatus; search?: string }) {
  try {
    const user = await requireAuth();
    return await leadService.getUserLeads(user.id, filters);
  } catch {
    return [];
  }
}

// Alias for backwards compatibility
export const getLeadsForUser = getUserLeads;

// ==================== UPDATE LEAD STATUS ====================

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    await leadService.updateLeadStatus(leadId, user.id, status);
    
    revalidatePath("/dashboard/leads");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating lead status:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update lead" 
    };
  }
}

// ==================== UPDATE LEAD NOTES ====================

export async function updateLeadNotes(
  leadId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    await leadService.updateLeadNotes(leadId, user.id, notes);
    
    revalidatePath("/dashboard/leads");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating lead notes:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update notes" 
    };
  }
}

// ==================== DELETE LEAD ====================

export async function deleteLead(
  leadId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();
    await leadService.deleteLead(leadId, user.id);
    
    revalidatePath("/dashboard/leads");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting lead:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete lead" 
    };
  }
}

// ==================== GET LEAD STATS ====================

export async function getLeadStats() {
  try {
    const user = await requireAuth();
    return await leadService.getLeadStats(user.id);
  } catch {
    return [];
  }
}

// ==================== TRACK PAGE VIEW ====================

export async function trackPageView(siteId: string, variant?: "A" | "B") {
  // TODO: Implement analytics tracking with variant
  // For now, this is a no-op placeholder
  return { success: true };
}
