import { injectable, inject } from 'inversify';
import { Context } from 'hono';
import { Controller } from '../../../shared/decorators/controller.decorator';
import { OrdersService } from '../services/orders.service';

@injectable()
@Controller('/orders')
export class OrdersController {
  constructor(
    @inject('OrdersService') private ordersService: OrdersService
  ) {}

  async createOrder(c: Context) {
    try {
      const orderData = await c.req.json();

      // Basic validation
      if (!orderData.customerId || !orderData.items?.length) {
        return c.json({
          error: 'Missing required fields: customerId, items'
        }, 400);
      }

      const order = await this.ordersService.createOrder(orderData);

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
  }

  async getOrder(c: Context) {
    try {
      const orderId = c.req.param('id');
      
      if (!orderId) {
        return c.json({ error: 'Order ID is required' }, 400);
      }

      const order = await this.ordersService.getOrder(orderId);

      return c.json(order);

    } catch (error) {
      console.error('Error getting order:', error);
      return c.json({
        error: 'Failed to get order'
      }, 500);
    }
  }

  async updateOrderStatus(c: Context) {
    try {
      const orderId = c.req.param('id');
      const { status } = await c.req.json();
      
      if (!orderId || !status) {
        return c.json({ 
          error: 'Order ID and status are required' 
        }, 400);
      }

      const order = await this.ordersService.updateOrderStatus(orderId, status);

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
  }

  async getCustomerOrders(c: Context) {
    try {
      const customerId = c.req.param('customerId');
      
      if (!customerId) {
        return c.json({ error: 'Customer ID is required' }, 400);
      }

      const orders = await this.ordersService.getOrdersByCustomer(customerId);

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
  }
}