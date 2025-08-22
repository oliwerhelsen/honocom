import { Hono } from 'hono';
import { CatalogController } from '../controllers/catalog.controller';

export function setupCatalogRoutes(app: Hono, catalogController: CatalogController): void {
  // Product routes
  app.post('/api/v1/catalog/products', (c) => catalogController.createProduct(c));
  app.get('/api/v1/catalog/products/:id', (c) => catalogController.getProduct(c));
  app.get('/api/v1/catalog/products', (c) => catalogController.searchProducts(c));

  // Categories routes (placeholder)
  app.get('/api/v1/catalog/categories', (c) => {
    return c.json({
      message: 'Categories endpoint - coming soon',
      categories: []
    });
  });

  // Health check for catalog module
  app.get('/api/v1/catalog/health', (c) => {
    return c.json({
      module: 'catalog',
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });
}