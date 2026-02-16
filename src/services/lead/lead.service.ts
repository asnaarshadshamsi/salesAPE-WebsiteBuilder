import { CreateLeadInput, LeadStatus } from '@/types';
import { leadRepository, siteRepository } from '@/db/repositories';
import { notifyOwnerOfNewLead, sendLeadAutoResponse } from '@/lib/lead-notifications';

/**
 * Lead service - handles all lead-related operations
 */
export class LeadService {
  /**
   * Get leads for a user with optional filters
   */
  async getUserLeads(userId: string, filters?: { status?: LeadStatus; search?: string }) {
    return await leadRepository.findByUserId(userId, filters);
  }

  /**
   * Create a new lead
   */
  async createLead(input: CreateLeadInput) {
    // Validate required fields
    if (!input.name || !input.email || !input.siteId) {
      throw new Error('Name and email are required');
    }

    // Verify site exists and get business info
    const site = await siteRepository.findById(input.siteId);
    if (!site) {
      throw new Error('Site not found');
    }

    // Get full site with business and user data for notifications
    const siteWithBusiness = await siteRepository.findBySlug(site.slug);
    if (!siteWithBusiness) {
      throw new Error('Site not found');
    }

    // Create lead
    const lead = await leadRepository.create(input);

    // Send notifications (async, don't wait)
    this.sendNotificationsAsync(lead, siteWithBusiness);

    return lead;
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(leadId: string, userId: string, status: LeadStatus) {
    // Verify lead belongs to user
    const leads = await leadRepository.findByUserId(userId);
    const lead = leads.find((l: any) => l.id === leadId);
    
    if (!lead) {
      throw new Error('Lead not found');
    }

    return await leadRepository.updateStatus(leadId, status);
  }

  /**
   * Update lead notes
   */
  async updateLeadNotes(leadId: string, userId: string, notes: string) {
    // Verify lead belongs to user
    const leads = await leadRepository.findByUserId(userId);
    const lead = leads.find((l: any) => l.id === leadId);
    
    if (!lead) {
      throw new Error('Lead not found');
    }

    return await leadRepository.updateNotes(leadId, notes);
  }

  /**
   * Delete lead
   */
  async deleteLead(leadId: string, userId: string) {
    // Verify lead belongs to user
    const leads = await leadRepository.findByUserId(userId);
    const lead = leads.find((l: any) => l.id === leadId);
    
    if (!lead) {
      throw new Error('Lead not found');
    }

    await leadRepository.delete(leadId);
  }

  /**
   * Get lead statistics by status
   */
  async getLeadStats(userId: string) {
    return await leadRepository.countByStatus(userId);
  }

  /**
   * Send notifications asynchronously
   */
  private async sendNotificationsAsync(lead: any, siteWithBusiness: any) {
    try {
      // Prepare lead and business data
      const leadData = {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message: lead.message,
        variant: lead.variant,
        createdAt: lead.createdAt || new Date(),
      };

      const businessData = {
        name: siteWithBusiness.business.name,
        email: siteWithBusiness.business.email,
        phone: siteWithBusiness.business.phone,
        ownerEmail: siteWithBusiness.business.email || '',
        siteUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/sites/${siteWithBusiness.slug}`,
        calendlyUrl: siteWithBusiness.business.calendlyUrl,
      };

      // Send notification to business owner
      if (businessData.ownerEmail) {
        await notifyOwnerOfNewLead(leadData, businessData);
      }

      // Send auto-response to lead
      await sendLeadAutoResponse(leadData, businessData);
    } catch (error) {
      console.error('Error sending lead notifications:', error);
      // Don't throw - notifications are not critical
    }
  }
}

export const leadService = new LeadService();
