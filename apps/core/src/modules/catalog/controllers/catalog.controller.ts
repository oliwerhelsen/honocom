import { injectable, inject } from 'inversify';
import { Context } from 'hono';
import { Controller } from '../../../shared/decorators/controller.decorator';
import { CatalogService } from '../services/catalog.service';

@injectable()
@Controller('/catalog')
export class CatalogController {
  constructor(
    @inject('CatalogService') private catalogService: CatalogService
  ) {}

  async createProduct(c: Context) {
    try {
      const productData = await c.req.json();

      // Basic validation
      if (!productData.name || !productData.sku || !productData.listPrice) {
        return c.json({
          error: 'Missing required fields: name, sku, listPrice'
        }, 400);
      }

      const product = await this.catalogService.createProduct(productData);

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
  }

  async getProduct(c: Context) {
    try {
      const productId = c.req.param('id');
      
      if (!productId) {
        return c.json({ error: 'Product ID is required' }, 400);
      }

      const product = await this.catalogService.getProduct(productId);

      return c.json(product);

    } catch (error) {
      console.error('Error getting product:', error);
      return c.json({
        error: 'Failed to get product'
      }, 500);
    }
  }

  async searchProducts(c: Context) {
    try {
      const query = c.req.query('q') || '';
      const limit = parseInt(c.req.query('limit') || '10');
      const offset = parseInt(c.req.query('offset') || '0');

      const result = await this.catalogService.searchProducts(query, limit, offset);

      return c.json(result);

    } catch (error) {
      console.error('Error searching products:', error);
      return c.json({
        error: 'Failed to search products'
      }, 500);
    }
  }
}