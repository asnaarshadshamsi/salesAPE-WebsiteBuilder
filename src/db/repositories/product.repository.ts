import { ProductData } from '@/types';
import { prisma } from '../client';

export class ProductRepository {
  /**
   * Find products by business ID
   */
  async findByBusinessId(businessId: string) {
    return await prisma.product.findMany({
      where: { businessId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Create multiple products
   */
  async createMany(businessId: string, products: ProductData[]): Promise<void> {
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      await prisma.product.create({
        data: {
          businessId,
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

  /**
   * Update product
   */
  async update(productId: string, data: Partial<ProductData>) {
    return await prisma.product.update({
      where: { id: productId },
      data,
    });
  }

  /**
   * Delete product
   */
  async delete(productId: string): Promise<void> {
    await prisma.product.delete({
      where: { id: productId },
    });
  }
}

export const productRepository = new ProductRepository();
