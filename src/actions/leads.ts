"use server";

import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notifyOwnerOfNewLead, sendLeadAutoResponse } from "@/lib/lead-notifications";

// LeadStatus enum values
const LeadStatusValues = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  BOOKED: 'BOOKED',
  CONVERTED: 'CONVERTED',
  LOST: 'LOST'
} as const;

type LeadStatus = typeof LeadStatusValues[keyof typeof LeadStatusValues];

// Define types locally to avoid Prisma import issues
type Lead = {
  id: string;
  siteId: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: LeadStatus;
  variant: string | null;
  createdAt: Date;
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

type Business = {
  id: string;
  name: string;
};

// Type for lead with relations
export type LeadWithRelations = Lead & {
  site: Site & {
    business: Pick<Business, 'name'>;
  };
};

export interface CreateLeadInput {
  siteId: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  variant?: string;
}

export async function createLead(
  input: CreateLeadInput
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate required fields
    if (!input.name || !input.email || !input.siteId) {
      return { success: false, error: "Name and email are required" };
    }

    // Verify site exists and get business info for notifications
    const site = await prisma.site.findUnique({
      where: { id: input.siteId },
      include: {
        business: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      }
    });

    if (!site) {
      return { success: false, error: "Site not found" };
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        siteId: input.siteId,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        message: input.message || null,
        variant: input.variant || null,
        source: "form",
      },
    });

    // Update conversion count for A/B testing
    if (input.variant === "A") {
      await prisma.site.update({
        where: { id: input.siteId },
        data: { conversionsA: { increment: 1 } },
      });
    } else if (input.variant === "B") {
      await prisma.site.update({
        where: { id: input.siteId },
        data: { conversionsB: { increment: 1 } },
      });
    }

    // Send notifications (non-blocking)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    // Notify business owner of new lead
    notifyOwnerOfNewLead(
      {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message: lead.message,
        source: lead.source,
        variant: lead.variant,
        createdAt: lead.createdAt,
      },
      {
        name: site.business.name,
        email: site.business.email,
        phone: site.business.phone,
        ownerEmail: site.business.user.email,
        siteUrl: appUrl,
        calendlyUrl: site.business.calendlyUrl,
      }
    ).catch(err => console.error("Failed to send owner notification:", err));

    // Send auto-response to lead (optional feature)
    sendLeadAutoResponse(
      {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message: lead.message,
        source: lead.source,
        variant: lead.variant,
        createdAt: lead.createdAt,
      },
      {
        name: site.business.name,
        email: site.business.email,
        phone: site.business.phone,
        ownerEmail: site.business.user.email,
        siteUrl: appUrl,
        calendlyUrl: site.business.calendlyUrl,
      }
    ).catch(err => console.error("Failed to send auto-response:", err));

    return { success: true };
  } catch (error) {
    console.error("Error creating lead:", error);
    return { success: false, error: "Failed to submit. Please try again." };
  }
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();

    // Verify ownership through the chain: user -> business -> site -> lead
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        site: {
          business: {
            userId: user.id,
          },
        },
      },
    });

    if (!lead) {
      return { success: false, error: "Lead not found" };
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });

    revalidatePath("/dashboard/leads");

    return { success: true };
  } catch (error) {
    console.error("Error updating lead status:", error);
    return { success: false, error: "Failed to update lead status" };
  }
}

export async function deleteLead(
  leadId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth();

    // Verify ownership
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        site: {
          business: {
            userId: user.id,
          },
        },
      },
    });

    if (!lead) {
      return { success: false, error: "Lead not found" };
    }

    await prisma.lead.delete({
      where: { id: leadId },
    });

    revalidatePath("/dashboard/leads");

    return { success: true };
  } catch (error) {
    console.error("Error deleting lead:", error);
    return { success: false, error: "Failed to delete lead" };
  }
}

export async function getLeadsForUser() {
  try {
    const user = await requireAuth();

    const leads = await prisma.lead.findMany({
      where: {
        site: {
          business: {
            userId: user.id,
          },
        },
      },
      include: {
        site: {
          include: {
            business: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return leads;
  } catch {
    return [];
  }
}

export async function getLeadById(leadId: string) {
  try {
    const user = await requireAuth();

    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        site: {
          business: {
            userId: user.id,
          },
        },
      },
      include: {
        site: {
          include: {
            business: true,
          },
        },
      },
    });

    return lead;
  } catch {
    return null;
  }
}

export async function trackPageView(siteId: string, variant: "A" | "B") {
  try {
    if (variant === "A") {
      await prisma.site.update({
        where: { id: siteId },
        data: { viewsA: { increment: 1 } },
      });
    } else {
      await prisma.site.update({
        where: { id: siteId },
        data: { viewsB: { increment: 1 } },
      });
    }
  } catch (error) {
    console.error("Error tracking page view:", error);
  }
}
