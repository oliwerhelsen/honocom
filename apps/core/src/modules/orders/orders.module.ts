import { Hono } from 'hono';
import { Module } from '../../shared/decorators/module.decorator';
import { BaseModule } from '../../shared/module/base-module';
import { OrdersService } from './services/orders.service';

@Module({
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule extends BaseModule {
  constructor() {
    super();
    console.log('📦 OrdersModule initialized');
  }

  registerRoutes(app: Hono): void {
    const ordersService = this.container.get<OrdersService>('OrdersService');

    // Create order
    app.post('/api/v1/orders', async (c) => {
      try {
        const orderData = await c.req.json();

        // Basic validation
        if (!orderData.customerId || !orderData.items?.length) {
          return c.json({
            error: 'Missing required fields: customerId, items'
          }, 400);
        }

        const order = await ordersService.createOrder(orderData);

        return c.json({
          message: 'Order created successfully',
          order
        }, 201);

      } catch (error) {
        console.error('Error creating order:', error);
        return c.json({
          error: 'Failed to create order'
        }, 500);
      }
    });

    // Get order by ID
    app.get('/api/v1/orders/:id', async (c) => {
      try {
        const orderId = c.req.param('id');
        
        if (!orderId) {
          return c.json({ error: 'Order ID is required' }, 400);
        }

        const order = await ordersService.getOrder(orderId);

        return c.json(order);

      } catch (error) {
        console.error('Error getting order:', error);
        return c.json({
          error: 'Failed to get order'
        }, 500);
      }
    });

    // Update order status
    app.patch('/api/v1/orders/:id/status', async (c) => {
      try {
        const orderId = c.req.param('id');
        const { status } = await c.req.json();
        
        if (!orderId || !status) {
          return c.json({ 
            error: 'Order ID and status are required' 
          }, 400);
        }

        const order = await ordersService.updateOrderStatus(orderId, status);

        return c.json({
          message: 'Order status updated successfully',
          order
        });

      } catch (error) {
        console.error('Error updating order:', error);
        return c.json({
          error: 'Failed to update order'
        }, 500);
      }
    });

    // Get customer orders
    app.get('/api/v1/orders/customer/:customerId', async (c) => {
      try {
        const customerId = c.req.param('customerId');
        
        if (!customerId) {
          return c.json({ error: 'Customer ID is required' }, 400);
        }

        const orders = await ordersService.getOrdersByCustomer(customerId);

        return c.json({
          customerId,
          orders
        });

      } catch (error) {
        console.error('Error getting customer orders:', error);
        return c.json({
          error: 'Failed to get customer orders'
        }, 500);
      }
    });

    // Health check for orders module
    app.get('/api/v1/orders/health', (c) => {
      return c.json({
        module: 'orders',
        status: 'ok',
        timestamp: new Date().toISOString()
      });
    });
  }
}