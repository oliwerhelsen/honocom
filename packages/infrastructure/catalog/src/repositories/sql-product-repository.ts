import { ProductRepository } from "@application/catalog";
import {
  CategoryId,
  Product,
  ProductDescription,
  ProductId,
  ProductName,
  ProductPrice,
} from "@domain/catalog";
import { Money } from "@domain/shared-kernel";
import { DatabaseConnection } from "@infrastructure/shared";

interface ProductRow {
  id: string;
  name: string;
  description: string;
  sku: string;
  list_price: number;
  sale_price?: number;
  currency: string;
  status: string;
  category_id?: string;
  created_at: Date;
  updated_at: Date;
}

export class SqlProductRepository implements ProductRepository {
  constructor(private db: DatabaseConnection) {}

  async save(product: Product): Promise<void> {
    const existingProduct = await this.findById(product.id);

    if (existingProduct) {
      await this.update(product);
    } else {
      await this.insert(product);
    }
  }

  async findById(id: ProductId): Promise<Product | null> {
    const sql = `
      SELECT * FROM products 
      WHERE id = ?
    `;

    const row = await this.db.queryOne<ProductRow>(sql, [id.value]);

    if (!row) {
      return null;
    }

    return this.mapToDomain(row);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const sql = `
      SELECT * FROM products 
      WHERE sku = ?
    `;

    const row = await this.db.queryOne<ProductRow>(sql, [sku]);

    if (!row) {
      return null;
    }

    return this.mapToDomain(row);
  }

  async findByCategory(
    categoryId: string,
    limit = 50,
    offset = 0
  ): Promise<Product[]> {
    const sql = `
      SELECT * FROM products 
      WHERE category_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await this.db.query<ProductRow>(sql, [
      categoryId,
      limit,
      offset,
    ]);

    return rows.map((row) => this.mapToDomain(row));
  }

  async search(query: string, limit = 50, offset = 0): Promise<Product[]> {
    const sql = `
      SELECT * FROM products 
      WHERE name ILIKE ? OR description ILIKE ? OR sku ILIKE ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const searchTerm = `%${query}%`;
    const rows = await this.db.query<ProductRow>(sql, [
      searchTerm,
      searchTerm,
      searchTerm,
      limit,
      offset,
    ]);

    return rows.map((row) => this.mapToDomain(row));
  }

  async delete(id: ProductId): Promise<void> {
    const sql = `DELETE FROM products WHERE id = ?`;
    await this.db.execute(sql, [id.value]);
  }

  async exists(sku: string): Promise<boolean> {
    const sql = `SELECT 1 FROM products WHERE sku = ? LIMIT 1`;
    const result = await this.db.queryOne(sql, [sku]);
    return !!result;
  }

  private async insert(product: Product): Promise<void> {
    const sql = `
      INSERT INTO products (
        id, name, description, sku, list_price, sale_price, 
        currency, status, category_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.execute(sql, [
      product.id.value,
      product.name.value,
      product.description.value,
      product.sku,
      product.price.listPrice.amount,
      product.price.salePrice?.amount || null,
      product.price.listPrice.currency,
      product.status,
      product.categoryId?.value || null,
      product.createdAt,
      product.updatedAt,
    ]);
  }

  private async update(product: Product): Promise<void> {
    const sql = `
      UPDATE products SET
        name = ?, description = ?, sku = ?, list_price = ?, 
        sale_price = ?, currency = ?, status = ?, 
        category_id = ?, updated_at = ?
      WHERE id = ?
    `;

    await this.db.execute(sql, [
      product.name.value,
      product.description.value,
      product.sku,
      product.price.listPrice.amount,
      product.price.salePrice?.amount || null,
      product.price.listPrice.currency,
      product.status,
      product.categoryId?.value || null,
      product.updatedAt,
      product.id.value,
    ]);
  }

  private mapToDomain(row: ProductRow): Product {
    const name = new ProductName(row.name);
    const description = new ProductDescription(row.description);

    const listPrice = new Money(row.list_price, row.currency);
    const salePrice = row.sale_price
      ? new Money(row.sale_price, row.currency)
      : undefined;
    const price = new ProductPrice(listPrice, salePrice);

    const categoryId = row.category_id
      ? CategoryId.fromString(row.category_id)
      : undefined;
    const productId = ProductId.fromString(row.id);

    // Vi behöver en factory method för att skapa Product från DB
    // Detta kommer vi fixa när vi implementerar Product.fromPersistence()
    return Product.create(
      name,
      description,
      price,
      row.sku,
      categoryId,
      productId
    );
  }
}
