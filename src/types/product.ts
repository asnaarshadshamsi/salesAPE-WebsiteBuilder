export interface ProductData {
  name: string;
  description?: string;
  price?: number;
  salePrice?: number;
  image?: string;
  category?: string;
}

export interface Product extends ProductData {
  id: string;
  businessId: string;
  sortOrder: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
