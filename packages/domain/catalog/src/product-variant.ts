import { Entity } from "@domain/shared-kernel";
import { ProductPrice } from "./value-object/product-price";

export interface ProductVariantProps {
  sku: string;
  name: string;
  price?: ProductPrice;
  stockQuantity: number;
  attributes: Record<string, string>; // e.g., { size: 'L', color: 'Blue' }
}

export class ProductVariant extends Entity<string> {
  private constructor(
    id: string,
    private props: ProductVariantProps
  ) {
    super(id);
    this.validate();
  }

  static create(props: ProductVariantProps, id?: string): ProductVariant {
    return new ProductVariant(id ?? crypto.randomUUID(), props);
  }

  get sku(): string {
    return this.props.sku;
  }

  get name(): string {
    return this.props.name;
  }

  get price(): ProductPrice | undefined {
    return this.props.price;
  }

  get stockQuantity(): number {
    return this.props.stockQuantity;
  }

  get attributes(): Record<string, string> {
    return { ...this.props.attributes };
  }

  get isInStock(): boolean {
    return this.props.stockQuantity > 0;
  }

  updatePrice(price: ProductPrice): void {
    this.props.price = price;
  }

  updateStock(quantity: number): void {
    if (quantity < 0) {
      throw new Error("Stock quantity cannot be negative");
    }
    this.props.stockQuantity = quantity;
  }

  reserveStock(quantity: number): void {
    if (quantity > this.props.stockQuantity) {
      throw new Error("Cannot reserve more stock than available");
    }
    this.props.stockQuantity -= quantity;
  }

  private validate(): void {
    if (!this.props.sku || this.props.sku.trim().length === 0) {
      throw new Error("Product variant SKU cannot be empty");
    }

    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error("Product variant name cannot be empty");
    }

    if (this.props.stockQuantity < 0) {
      throw new Error("Stock quantity cannot be negative");
    }
  }
}
