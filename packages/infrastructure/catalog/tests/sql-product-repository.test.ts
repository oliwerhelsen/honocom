import { SqlProductRepository } from "../src/repositories/sql-product-repository";
import { DatabaseConnection } from "@infrastructure/shared";
import { Product, ProductName, ProductDescription, ProductPrice, ProductId } from "@domain/catalog";
import { Money } from "@domain/shared-kernel";

describe("SqlProductRepository", () => {
  let repository: SqlProductRepository;
  let mockDb: jest.Mocked<DatabaseConnection>;

  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
      queryOne: jest.fn(),
      execute: jest.fn(),
      transaction: jest.fn(),
    } as jest.Mocked<DatabaseConnection>;

    repository = new SqlProductRepository(mockDb);
  });

  describe("save", () => {
    it("should insert new product when it doesn't exist", async () => {
      // Arrange
      const product = Product.create(
        new ProductName("Test Product"),
        new ProductDescription("Test description"),
        new ProductPrice(new Money(100, "SEK")),
        "TEST-001"
      );

      mockDb.queryOne.mockResolvedValue(null); // Product doesn't exist
      mockDb.execute.mockResolvedValue(undefined);

      // Act
      await repository.save(product);

      // Assert
      expect(mockDb.queryOne).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM products"),
        [product.id.value]
      );
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO products"),
        expect.arrayContaining([
          product.id.value,
          "Test Product",
          "Test description",
          "TEST-001",
          100,
          null,
          "SEK",
          product.status,
          null,
          product.createdAt,
          product.updatedAt,
        ])
      );
    });

    it("should update existing product", async () => {
      // Arrange
      const product = Product.create(
        new ProductName("Test Product"),
        new ProductDescription("Test description"),
        new ProductPrice(new Money(100, "SEK")),
        "TEST-001"
      );

      const mockRow = {
        id: product.id.value,
        name: "Old Name",
        description: "Old description",
        sku: "TEST-001",
        list_price: 50,
        currency: "SEK",
        status: "Draft",
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.queryOne.mockResolvedValue(mockRow); // Product exists
      mockDb.execute.mockResolvedValue(undefined);

      // Act
      await repository.save(product);

      // Assert
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE products SET"),
        expect.arrayContaining([
          "Test Product",
          "Test description",
          "TEST-001",
          100,
          null,
          "SEK",
          product.status,
          null,
          product.updatedAt,
          product.id.value,
        ])
      );
    });
  });

  describe("findById", () => {
    it("should return product when found", async () => {
      // Arrange
      const productId = ProductId.create();
      const mockRow = {
        id: productId.value,
        name: "Test Product",
        description: "Test description",
        sku: "TEST-001",
        list_price: 100,
        currency: "SEK",
        status: "Active",
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.queryOne.mockResolvedValue(mockRow);

      // Act
      const result = await repository.findById(productId);

      // Assert
      expect(result).toBeInstanceOf(Product);
      expect(result!.name.value).toBe("Test Product");
      expect(result!.sku).toBe("TEST-001");
      expect(mockDb.queryOne).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM products"),
        [productId.value]
      );
    });

    it("should return null when product not found", async () => {
      // Arrange
      const productId = ProductId.create();
      mockDb.queryOne.mockResolvedValue(null);

      // Act
      const result = await repository.findById(productId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findBySku", () => {
    it("should return product when found by SKU", async () => {
      // Arrange
      const sku = "TEST-001";
      const mockRow = {
        id: ProductId.create().value,
        name: "Test Product",
        description: "Test description",
        sku: sku,
        list_price: 100,
        currency: "SEK",
        status: "Active",
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.queryOne.mockResolvedValue(mockRow);

      // Act
      const result = await repository.findBySku(sku);

      // Assert
      expect(result).toBeInstanceOf(Product);
      expect(result!.sku).toBe(sku);
      expect(mockDb.queryOne).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM products"),
        [sku]
      );
    });
  });

  describe("exists", () => {
    it("should return true when product with SKU exists", async () => {
      // Arrange
      const sku = "TEST-001";
      mockDb.queryOne.mockResolvedValue({ exists: 1 });

      // Act
      const result = await repository.exists(sku);

      // Assert
      expect(result).toBe(true);
      expect(mockDb.queryOne).toHaveBeenCalledWith(
        expect.stringContaining("SELECT 1 FROM products"),
        [sku]
      );
    });

    it("should return false when product with SKU doesn't exist", async () => {
      // Arrange
      const sku = "NONEXISTENT";
      mockDb.queryOne.mockResolvedValue(null);

      // Act
      const result = await repository.exists(sku);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("search", () => {
    it("should search products by query", async () => {
      // Arrange
      const query = "test";
      const mockRows = [
        {
          id: ProductId.create().value,
          name: "Test Product 1",
          description: "Test description 1",
          sku: "TEST-001",
          list_price: 100,
          currency: "SEK",
          status: "Active",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: ProductId.create().value,
          name: "Test Product 2",
          description: "Test description 2",
          sku: "TEST-002",
          list_price: 200,
          currency: "SEK",
          status: "Active",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.query.mockResolvedValue(mockRows);

      // Act
      const results = await repository.search(query);

      // Assert
      expect(results).toHaveLength(2);
      expect(results[0]).toBeInstanceOf(Product);
      expect(results[1]).toBeInstanceOf(Product);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE name ILIKE ? OR description ILIKE ? OR sku ILIKE ?"),
        ["%test%", "%test%", "%test%", 50, 0]
      );
    });
  });

  describe("delete", () => {
    it("should delete product by id", async () => {
      // Arrange
      const productId = ProductId.create();
      mockDb.execute.mockResolvedValue(undefined);

      // Act
      await repository.delete(productId);

      // Assert
      expect(mockDb.execute).toHaveBeenCalledWith(
        "DELETE FROM products WHERE id = ?",
        [productId.value]
      );
    });
  });
});