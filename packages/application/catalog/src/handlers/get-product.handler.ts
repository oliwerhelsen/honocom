import { ProductId } from "@domain/catalog";
import {
  GetProductBySkuQuery,
  GetProductQuery,
} from "../queries/get-product.query";
import { ProductRepository } from "../repositories/product-repository";

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  sku: string;
  listPrice: number;
  salePrice?: number;
  currency: string;
  isOnSale: boolean;
  status: string;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetProductHandler {
  constructor(private productRepository: ProductRepository) {}

  async handleById(query: GetProductQuery): Promise<ProductDto | null> {
    const productId = ProductId.fromString(query.productId);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      return null;
    }

    return this.mapToDto(product);
  }

  async handleBySku(query: GetProductBySkuQuery): Promise<ProductDto | null> {
    const product = await this.productRepository.findBySku(query.sku);

    if (!product) {
      return null;
    }

    return this.mapToDto(product);
  }

  private mapToDto(product: any): ProductDto {
    return {
      id: product.id.value,
      name: product.name.value,
      description: product.description.value,
      sku: product.sku,
      listPrice: product.price.listPrice.amount,
      salePrice: product.price.salePrice?.amount,
      currency: product.price.listPrice.currency,
      isOnSale: product.price.isOnSale,
      status: product.status,
      categoryId: product.categoryId?.value,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
