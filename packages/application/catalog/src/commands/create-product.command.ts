export interface CreateProductCommand {
  name: string;
  description: string;
  listPrice: number;
  currency: string;
  sku: string;
  categoryId?: string;
  salePrice?: number;
}
