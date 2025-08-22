import { Hono } from 'hono';
import { Module } from '../../shared/decorators/module.decorator';
import { BaseModule } from '../../shared/module/base-module';
import { CatalogService } from './services/catalog.service';

@Module({
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule extends BaseModule {
  constructor() {
    super();
    console.log('📦 CatalogModule initialized');
  }

  registerRoutes(app: Hono): void {
    const catalogService = this.container.get<CatalogService>('CatalogService');

    // Product routes
    app.post('/api/v1/catalog/products', async (c) => {
      try {
        const productData = await c.req.json();

        // Basic validation
        if (!productData.name || !productData.sku || !productData.listPrice) {
          return c.json({
            error: 'Missing required fields: name, sku, listPrice'
          }, 400);
        }

        const product = await catalogService.createProduct(productData);

        return c.json({
          message: 'Product created successfully',
          product
        }, 201);

      } catch (error) {
        console.error('Error creating product:', error);
        return c.json({
          error: 'Failed to create product'
        }, 500);
      }
    });

    app.get('/api/v1/catalog/products/:id', async (c) => {
      try {
        const productId = c.req.param('id');
        
        if (!productId) {
          return c.json({ error: 'Product ID is required' }, 400);
        }

        const product = await catalogService.getProduct(productId);

        return c.json(product);

      } catch (error) {
        console.error('Error getting product:', error);
        return c.json({
          error: 'Failed to get product'
        }, 500);
      }
    });

    app.get('/api/v1/catalog/products', async (c) => {
      try {
        const query = c.req.query('q') || '';
        const limit = parseInt(c.req.query('limit') || '10');
        const offset = parseInt(c.req.query('offset') || '0');

        const result = await catalogService.searchProducts(query, limit, offset);

        return c.json(result);

      } catch (error) {
        console.error('Error searching products:', error);
        return c.json({
          error: 'Failed to search products'
        }, 500);
      }
    });

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
}