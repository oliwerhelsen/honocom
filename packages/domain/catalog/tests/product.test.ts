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

  it("should update product name", () => {
    // Arrange
    const name = new ProductName("Test Product");
    const description = new ProductDescription("A great test product");
    const money = new Money(100, "SEK");
    const price = new ProductPrice(money);
    const sku = "TEST-001";
    const product = Product.create(name, description, price, sku);
    
    const newName = new ProductName("Updated Product");

    // Act
    product.updateName(newName);

    // Assert
    expect(product.name.value).toBe("Updated Product");
  });

  it("should update product price and add domain event", () => {
    // Arrange
    const name = new ProductName("Test Product");
    const description = new ProductDescription("A great test product");
    const money = new Money(100, "SEK");
    const price = new ProductPrice(money);
    const sku = "TEST-001";
    const product = Product.create(name, description, price, sku);
    
    const newMoney = new Money(150, "SEK");
    const newPrice = new ProductPrice(newMoney);

    // Act
    product.updatePrice(newPrice);

    // Assert
    expect(product.price.effectivePrice.amount).toBe(150);
    expect(product.domainEvents).toHaveLength(2); // ProductCreated + ProductPriceChanged
    expect(product.domainEvents[1].eventType).toBe("ProductPriceChanged");
  });

  it("should activate product", () => {
    // Arrange
    const name = new ProductName("Test Product");
    const description = new ProductDescription("A great test product");
    const money = new Money(100, "SEK");
    const price = new ProductPrice(money);
    const sku = "TEST-001";
    const product = Product.create(name, description, price, sku);

    // Act
    product.activate();

    // Assert
    expect(product.status).toBe(ProductStatus.Active);
    expect(product.isActive).toBe(true);
  });

  it("should deactivate product", () => {
    // Arrange
    const name = new ProductName("Test Product");
    const description = new ProductDescription("A great test product");
    const money = new Money(100, "SEK");
    const price = new ProductPrice(money);
    const sku = "TEST-001";
    const product = Product.create(name, description, price, sku);
    product.activate();

    // Act
    product.deactivate();

    // Assert
    expect(product.status).toBe(ProductStatus.Inactive);
    expect(product.isActive).toBe(false);
  });

  it("should not activate discontinued product", () => {
    // Arrange
    const name = new ProductName("Test Product");
    const description = new ProductDescription("A great test product");
    const money = new Money(100, "SEK");
    const price = new ProductPrice(money);
    const sku = "TEST-001";
    const product = Product.create(name, description, price, sku);
    product.discontinue();

    // Act & Assert
    expect(() => product.activate()).toThrow("Cannot activate a discontinued product");
  });

  it("should add and remove tags", () => {
    // Arrange
    const name = new ProductName("Test Product");
    const description = new ProductDescription("A great test product");
    const money = new Money(100, "SEK");
    const price = new ProductPrice(money);
    const sku = "TEST-001";
    const product = Product.create(name, description, price, sku);

    // Act
    product.addTag("electronics");
    product.addTag("gadget");
    product.removeTag("gadget");

    // Assert
    expect(product.tags).toContain("electronics");
    expect(product.tags).not.toContain("gadget");
    expect(product.tags).toHaveLength(1);
  });

  it("should validate required fields", () => {
    // Act & Assert
    expect(() => {
      new ProductName("");
    }).toThrow("Product name cannot be empty");

    expect(() => {
      new ProductName("A".repeat(256));
    }).toThrow("Product name cannot exceed 255 characters");

    expect(() => {
      new ProductDescription("A".repeat(5001));
    }).toThrow("Product description cannot exceed 5000 characters");
  });
});
