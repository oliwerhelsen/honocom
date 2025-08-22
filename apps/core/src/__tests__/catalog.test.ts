import 'reflect-metadata';
import { AppModule } from '../app.module';

describe('Catalog Module Integration', () => {
  let appModule: AppModule;
  
  beforeEach(() => {
    appModule = new AppModule();
  });

  describe('Catalog Endpoints', () => {
    it('should respond to catalog health check', async () => {
      const app = appModule.getApp();
      const res = await app.request('/api/v1/catalog/health');
      
      expect(res.status).toBe(200);
      
      const json = await res.json();
      expect(json.module).toBe('catalog');
      expect(json.status).toBe('ok');
      expect(json.timestamp).toBeDefined();
    });

    it('should handle product creation', async () => {
      const app = appModule.getApp();
      
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        listPrice: 999,
        currency: 'SEK'
      };
      
      const res = await app.request('/api/v1/catalog/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      expect(res.status).toBe(201);
      
      const json = await res.json();
      expect(json.message).toBe('Product created successfully');
      expect(json.product).toBeDefined();
      expect(json.product.name).toBe('Test Product');
      expect(json.product.sku).toBe('TEST-001');
    });

    it('should validate required fields for product creation', async () => {
      const app = appModule.getApp();
      
      const invalidProductData = {
        name: 'Test Product',
        // Missing required fields: sku, listPrice
      };
      
      const res = await app.request('/api/v1/catalog/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidProductData),
      });
      
      expect(res.status).toBe(400);
      
      const json = await res.json();
      expect(json.error).toContain('Missing required fields');
    });

    it('should handle product search', async () => {
      const app = appModule.getApp();
      const res = await app.request('/api/v1/catalog/products?q=test&limit=5');
      
      expect(res.status).toBe(200);
      
      const json = await res.json();
      expect(json.products).toBeDefined();
      expect(Array.isArray(json.products)).toBe(true);
    });

    it('should respond to categories endpoint', async () => {
      const app = appModule.getApp();
      const res = await app.request('/api/v1/catalog/categories');
      
      expect(res.status).toBe(200);
      
      const json = await res.json();
      expect(json.message).toContain('Categories endpoint');
      expect(json.categories).toBeDefined();
    });
  });
});