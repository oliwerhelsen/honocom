import { CreateProductCommand } from "../src/commands/create-product.command";
import { CreateProductHandler } from "../src/handlers/create-product.handler";
import { ProductRepository } from "../src/repositories/product-repository";
import { Product, ProductName, ProductDescription, ProductPrice } from "@domain/catalog";
import { Money } from "@domain/shared-kernel";

describe("CreateProductHandler", () => {
  let handler: CreateProductHandler;
  let mockRepository: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findBySku: jest.fn(),
      findByCategory: jest.fn(),
      search: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    } as jest.Mocked<ProductRepository>;

    handler = new CreateProductHandler(mockRepository);
  });

  it("should create a product successfully", async () => {
    // Arrange
    const command: CreateProductCommand = {
      name: "Test Product",
      description: "A great test product",
      listPrice: 100,
      currency: "SEK",
      sku: "TEST-001"
    };

    mockRepository.exists.mockResolvedValue(false);
    mockRepository.save.mockResolvedValue(undefined);

    // Act
    const productId = await handler.handle(command);

    // Assert
    expect(productId).toBeDefined();
    expect(typeof productId).toBe("string");
    expect(mockRepository.exists).toHaveBeenCalledWith("TEST-001");
    expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Product));
  });

  it("should create product with sale price", async () => {
    // Arrange
    const command: CreateProductCommand = {
      name: "Test Product",
      description: "A great test product", 
      listPrice: 100,
      currency: "SEK",
      sku: "TEST-001",
      salePrice: 80
    };

    mockRepository.exists.mockResolvedValue(false);
    mockRepository.save.mockResolvedValue(undefined);

    // Act
    const productId = await handler.handle(command);

    // Assert
    expect(productId).toBeDefined();
    expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Product));
  });

  it("should fail when product SKU already exists", async () => {
    // Arrange
    const command: CreateProductCommand = {
      name: "Test Product",
      description: "A great test product",
      listPrice: 100,
      currency: "SEK",
      sku: "EXISTING-SKU"
    };

    mockRepository.exists.mockResolvedValue(true);

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow("Product with SKU EXISTING-SKU already exists");
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it("should fail with invalid product data", async () => {
    // Arrange
    const command: CreateProductCommand = {
      name: "", // Invalid empty name
      description: "Description",
      listPrice: 100,
      currency: "SEK",
      sku: "TEST-001"
    };

    mockRepository.exists.mockResolvedValue(false);

    // Act & Assert
    await expect(handler.handle(command)).rejects.toThrow("Product name cannot be empty");
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});