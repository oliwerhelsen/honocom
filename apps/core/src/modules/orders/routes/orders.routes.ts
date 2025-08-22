import { Hono } from 'hono';
import { OrdersController } from '../controllers/orders.controller';

export function setupOrdersRoutes(app: Hono, ordersController: OrdersController): void {
  // Order CRUD routes
  app.post('/api/v1/orders', (c) => ordersController.createOrder(c));
  app.get('/api/v1/orders/:id', (c) => ordersController.getOrder(c));
  app.patch('/api/v1/orders/:id/status', (c) => ordersController.updateOrderStatus(c));

  // Customer orders
  app.get('/api/v1/customers/:customerId/orders', (c) => ordersController.getCustomerOrders(c));

  // Health check for orders module
  app.get('/api/v1/orders/health', (c) => {
    return c.json({
      module: 'orders',
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });
}