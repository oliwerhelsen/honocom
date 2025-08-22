import { Hono } from 'hono';
import { Module } from '../../shared/decorators/module.decorator';
import { BaseModule } from '../../shared/module/base-module';
import { CheckoutService } from './services/checkout.service';
import { CheckoutWorkflow } from './workflows/checkout.workflow';
import { CatalogModule } from '../catalog/catalog.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [CatalogModule, OrdersModule],
  providers: [CheckoutService, CheckoutWorkflow],
  exports: [CheckoutService],
  routes: (app: Hono) => {
    // Get service instance from container
    const container = new CheckoutModule().getContainer();
    const checkoutService = container.get(CheckoutService);
    
    // Checkout routes
    app.post('/api/v1/checkout', async (c) => {
      try {
        const cart = await c.req.json();
        const result = await checkoutService.processCheckout(cart);
        
        const statusCode = result.status === 'success' ? 200 : 400;
        return c.json(result, statusCode);
        
      } catch (error) {
        console.error('Checkout error:', error);
        return c.json({
          status: 'failed',
          message: 'Checkout failed: ' + (error as Error).message
        }, 500);
      }
    });

    app.post('/api/v1/checkout/summary', async (c) => {
      try {
        const cart = await c.req.json();
        const summary = await checkoutService.getCheckoutSummary(cart);
        
        return c.json(summary);
        
      } catch (error) {
        console.error('Checkout summary error:', error);
        return c.json({
          error: 'Failed to get checkout summary: ' + (error as Error).message
        }, 500);
      }
    });

    // Health check
    app.get('/api/v1/checkout/health', (c) => {
      return c.json({
        module: 'checkout',
        status: 'ok',
        timestamp: new Date().toISOString()
      });
    });
  }
})
export class CheckoutModule extends BaseModule {
  constructor() {
    super();
    console.log('🛒 CheckoutModule initialized');
  }
}