import { Site } from '@/types';
import { prisma } from '../client';

export class SiteRepository {
  /**
   * Find site by ID
   */
  async findById(siteId: string): Promise<Site | null> {
    return await prisma.site.findUnique({
      where: { id: siteId },
    });
  }

  /**
   * Find site by slug
   */
  async findBySlug(slug: string) {
    return await prisma.site.findUnique({
      where: { slug },
      include: {
        business: true,
      },
    });
  }

  /**
   * Find site by business ID
   */
  async findByBusinessId(businessId: string): Promise<Site | null> {
    return await prisma.site.findFirst({
      where: { businessId },
    });
  }

  /**
   * Create a new site
   */
  async create(data: any): Promise<Site> {
    return await prisma.site.create({ data });
  }

  /**
   * Update site
   */
  async update(siteId: string, data: Partial<Site>): Promise<Site> {
    return await prisma.site.update({
      where: { id: siteId },
      data,
    });
  }

  /**
   * Increment views for A/B testing
   */
  async incrementViews(siteId: string, variant: 'A' | 'B'): Promise<void> {
    await prisma.site.update({
      where: { id: siteId },
      data: {
        [variant === 'A' ? 'viewsA' : 'viewsB']: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Increment conversions for A/B testing
   */
  async incrementConversions(siteId: string, variant: 'A' | 'B'): Promise<void> {
    await prisma.site.update({
      where: { id: siteId },
      data: {
        [variant === 'A' ? 'conversionsA' : 'conversionsB']: {
          increment: 1,
        },
      },
    });
  }
}

export const siteRepository = new SiteRepository();
