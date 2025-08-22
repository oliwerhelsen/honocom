import { Money } from "@domain/shared-kernel";
import { ProductStatus } from "../src/enums/product-status";
import { Product } from "../src/product";
import { ProductDescription } from "../src/value-object/product-description";
import { ProductName } from "../src/value-object/product-name";
import { ProductPrice } from "../src/value-object/product-price";

describe("Product", () => {
  it("should create a new product", () => {
    // Arrange
    const name = new ProductName("Test Product");
    const description = new ProductDescription("A great test product");
    const money = new Money(100, "SEK");
    const price = new ProductPrice(money);
    const sku = "TEST-001";

    // Act
    const product = Product.create(name, description, price, sku);

    // Assert
    expect(product.name.value).toBe("Test Product");
    expect(product.description.value).toBe("A great test product");
    expect(product.price.effectivePrice.amount).toBe(100);
    expect(product.sku).toBe("TEST-001");
    expect(product.status).toBe(ProductStatus.Draft);
    expect(product.domainEvents).toHaveLength(1);
    expect(product.domainEvents[0].eventType).toBe("ProductCreated");
  });

  // ... resten av testerna
});
