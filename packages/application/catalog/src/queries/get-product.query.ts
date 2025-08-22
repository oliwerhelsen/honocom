export interface GetProductQuery {
  productId: string;
}

export interface GetProductBySkuQuery {
  sku: string;
}

export interface SearchProductsQuery {
  searchTerm: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
}
