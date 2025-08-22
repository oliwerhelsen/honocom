import { Product, ProductId } from "@domain/catalog";

export interface ProductRepository {
  save(product: Product): Promise<void>;
  findById(id: ProductId): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findByCategory(
    categoryId: string,
    limit?: number,
    offset?: number
  ): Promise<Product[]>;
  search(query: string, limit?: number, offset?: number): Promise<Product[]>;
  delete(id: ProductId): Promise<void>;
  exists(sku: string): Promise<boolean>;
}
