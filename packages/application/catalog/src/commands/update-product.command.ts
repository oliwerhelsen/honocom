export interface UpdateProductCommand {
  productId: string;
  name?: string;
  description?: string;
  listPrice?: number;
  currency?: string;
  salePrice?: number;
  categoryId?: string;
}
