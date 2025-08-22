import {
  CategoryId,
  Product,
  ProductDescription,
  ProductName,
  ProductPrice,
} from "@domain/catalog";
import { Money } from "@domain/shared-kernel";
import { CreateProductCommand } from "../commands/create-product.command";
import { ProductRepository } from "../repositories/product-repository";

export class CreateProductHandler {
  constructor(private productRepository: ProductRepository) {}

  async handle(command: CreateProductCommand): Promise<string> {
    // Check if SKU already exists
    const existingSku = await this.productRepository.exists(command.sku);
    if (existingSku) {
      throw new Error(`Product with SKU ${command.sku} already exists`);
    }

    // Create value objects
    const name = new ProductName(command.name);
    const description = new ProductDescription(command.description);
    const listPrice = new Money(command.listPrice, command.currency);

    let price: ProductPrice;
    if (command.salePrice) {
      const salePrice = new Money(command.salePrice, command.currency);
      price = new ProductPrice(listPrice, salePrice);
    } else {
      price = new ProductPrice(listPrice);
    }

    const categoryId = command.categoryId
      ? CategoryId.fromString(command.categoryId)
      : undefined;

    // Create product
    const product = Product.create(
      name,
      description,
      price,
      command.sku,
      categoryId
    );

    // Save to repository
    await this.productRepository.save(product);

    return product.id.value;
  }
}
