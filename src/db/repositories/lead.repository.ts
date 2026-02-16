import { Lead, LeadStatus } from '@/types';
import { prisma } from '../client';

export class LeadRepository {
  /**
   * Find lead by ID
   */
  async findById(leadId: string): Promise<Lead | null> {
    return await prisma.lead.findUnique({
      where: { id: leadId },
    });
  }

  /**
   * Find leads by site ID
   */
  async findBySiteId(siteId: string): Promise<Lead[]> {
    return await prisma.lead.findMany({
      where: { siteId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find leads for user's businesses
   */
  async findByUserId(userId: string, filters?: {
    status?: LeadStatus;
    search?: string;
  }) {
    const where: any = {
      site: {
        business: {
          userId,
        },
      },
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.lead.findMany({
      where,
      include: {
        site: {
          include: {
            business: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a new lead
   */
  async create(data: {
    siteId: string;
    name: string;
    email: string;
    phone?: string;
    message?: string;
    variant?: string;
  }): Promise<Lead> {
    return await prisma.lead.create({
      data: {
        siteId: data.siteId,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message || null,
        variant: data.variant || null,
        status: 'NEW',
      },
    });
  }

  /**
   * Update lead status
   */
  async updateStatus(leadId: string, status: LeadStatus): Promise<Lead> {
    return await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });
  }

  /**
   * Update lead notes
   */
  async updateNotes(leadId: string, notes: string): Promise<Lead> {
    return await prisma.lead.update({
      where: { id: leadId },
      data: { message: notes },
    });
  }

  /**
   * Delete lead
   */
  async delete(leadId: string): Promise<void> {
    await prisma.lead.delete({
      where: { id: leadId },
    });
  }

  /**
   * Count leads by status for a user
   */
  async countByStatus(userId: string) {
    return await prisma.lead.groupBy({
      by: ['status'],
      where: {
        site: {
          business: {
            userId,
          },
        },
      },
      _count: true,
    });
  }
}

export const leadRepository = new LeadRepository();
