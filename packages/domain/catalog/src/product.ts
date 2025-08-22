import { AggregateRoot } from "@domain/shared-kernel";
import { ProductStatus } from "./enums/product-status";
import { ProductCreated } from "./events/product-created";
import { ProductPriceChanged } from "./events/product-price-changed";
import { ProductVariant } from "./product-variant";
import { CategoryId } from "./value-object/category-id";
import { ProductDescription } from "./value-object/product-description";
import { ProductId } from "./value-object/product-id";
import { ProductName } from "./value-object/product-name";
import { ProductPrice } from "./value-object/product-price";

export interface ProductProps {
  name: ProductName;
  description: ProductDescription;
  price: ProductPrice;
  categoryId?: CategoryId;
  status: ProductStatus;
  sku: string;
  variants: ProductVariant[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Product extends AggregateRoot<ProductId> {
  private constructor(
    id: ProductId,
    private props: ProductProps
  ) {
    super(id);
    this.validate();
  }

  static create(
    name: ProductName,
    description: ProductDescription,
    price: ProductPrice,
    sku: string,
    categoryId?: CategoryId,
    id?: ProductId
  ): Product {
    const productId = id ?? ProductId.create();
    const now = new Date();

    const product = new Product(productId, {
      name,
      description,
      price,
      categoryId,
      status: ProductStatus.Draft,
      sku,
      variants: [],
      tags: [],
      createdAt: now,
      updatedAt: now,
    });

    product.addDomainEvent(
      new ProductCreated(productId, name.value, categoryId?.value)
    );

    return product;
  }

  get name(): ProductName {
    return this.props.name;
  }

  get description(): ProductDescription {
    return this.props.description;
  }

  get price(): ProductPrice {
    return this.props.price;
  }

  get categoryId(): CategoryId | undefined {
    return this.props.categoryId;
  }

  get status(): ProductStatus {
    return this.props.status;
  }

  get sku(): string {
    return this.props.sku;
  }

  get variants(): ProductVariant[] {
    return [...this.props.variants];
  }

  get tags(): string[] {
    return [...this.props.tags];
  }

  get isActive(): boolean {
    return this.props.status === ProductStatus.Active;
  }

  get isAvailable(): boolean {
    return (
      this.isActive &&
      (this.variants.length === 0 || this.variants.some((v) => v.isInStock))
    );
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateName(name: ProductName): void {
    this.props.name = name;
    this.touch();
  }

  updateDescription(description: ProductDescription): void {
    this.props.description = description;
    this.touch();
  }

  updatePrice(price: ProductPrice): void {
    const previousPrice = this.props.price.effectivePrice;
    this.props.price = price;
    this.touch();

    this.addDomainEvent(
      new ProductPriceChanged(this._id, previousPrice, price.effectivePrice)
    );
  }

  assignToCategory(categoryId: CategoryId): void {
    this.props.categoryId = categoryId;
    this.touch();
  }

  activate(): void {
    if (this.props.status === ProductStatus.Discontinued) {
      throw new Error("Cannot activate a discontinued product");
    }
    this.props.status = ProductStatus.Active;
    this.touch();
  }

  deactivate(): void {
    this.props.status = ProductStatus.Inactive;
    this.touch();
  }

  discontinue(): void {
    this.props.status = ProductStatus.Discontinued;
    this.touch();
  }

  addVariant(variant: ProductVariant): void {
    // Check for duplicate SKU
    if (this.props.variants.some((v) => v.sku === variant.sku)) {
      throw new Error(`Product variant with SKU ${variant.sku} already exists`);
    }

    this.props.variants.push(variant);
    this.touch();
  }

  removeVariant(variantId: string): void {
    const index = this.props.variants.findIndex((v) => v.id === variantId);
    if (index === -1) {
      throw new Error("Product variant not found");
    }

    this.props.variants.splice(index, 1);
    this.touch();
  }

  findVariant(variantId: string): ProductVariant | undefined {
    return this.props.variants.find((v) => v.id === variantId);
  }

  findVariantBySku(sku: string): ProductVariant | undefined {
    return this.props.variants.find((v) => v.sku === sku);
  }

  addTag(tag: string): void {
    if (!this.props.tags.includes(tag)) {
      this.props.tags.push(tag);
      this.touch();
    }
  }

  removeTag(tag: string): void {
    const index = this.props.tags.indexOf(tag);
    if (index > -1) {
      this.props.tags.splice(index, 1);
      this.touch();
    }
  }

  private validate(): void {
    if (!this.props.name) {
      throw new Error("Product name is required");
    }

    if (!this.props.price) {
      throw new Error("Product price is required");
    }

    if (!this.props.sku || this.props.sku.trim().length === 0) {
      throw new Error("Product SKU is required");
    }
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
