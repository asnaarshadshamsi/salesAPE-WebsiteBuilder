import { Business, BusinessWithSite } from '@/types';
import { prisma } from '../client';

export class BusinessRepository {
  /**
   * Find business by ID and user ID
   */
  async findByIdAndUser(businessId: string, userId: string): Promise<Business | null> {
    return await prisma.business.findFirst({
      where: { id: businessId, userId },
    });
  }

  /**
   * Find business by ID with site
   */
  async findByIdWithSite(businessId: string, userId: string) {
    return await prisma.business.findFirst({
      where: { id: businessId, userId },
      include: { site: true },
    });
  }

  /**
   * Find all businesses for a user with site and lead count
   */
  async findAllByUser(userId: string): Promise<BusinessWithSite[]> {
    return await prisma.business.findMany({
      where: { userId },
      include: {
        site: {
          include: {
            _count: {
              select: { leads: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a new business
   */
  async create(data: {
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
    leadFormFields: string | null;
  }): Promise<Business> {
    return await prisma.business.create({ data });
  }

  /**
   * Update business
   */
  async update(businessId: string, data: Partial<Business>): Promise<Business> {
    return await prisma.business.update({
      where: { id: businessId },
      data,
    });
  }

  /**
   * Delete business
   */
  async delete(businessId: string): Promise<void> {
    await prisma.business.delete({
      where: { id: businessId },
    });
  }

  /**
   * Update calendar tokens
   */
  async updateCalendarTokens(businessId: string, tokens: string): Promise<void> {
    await prisma.business.update({
      where: { id: businessId },
      data: { calendarTokens: tokens },
    });
  }
}

export const businessRepository = new BusinessRepository();
