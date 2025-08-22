import { injectable } from 'inversify';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  customerId: string;
  items: CartItem[];
  currency: string;
}

export interface CheckoutResult {
  orderId: string;
  status: 'success' | 'failed';
  message: string;
  totalAmount: number;
  currency: string;
}

@injectable()
export class CheckoutWorkflow {
  constructor() {}

  async processCheckout(cart: Cart): Promise<CheckoutResult> {
    try {
      console.log('🛒 Starting checkout process for customer:', cart.customerId);

      // Step 1: Validate products and get pricing
      const validatedItems = await this.validateCartItems(cart.items);
      
      // Step 2: Calculate total
      const totalAmount = this.calculateTotal(validatedItems);
      
      // Step 3: Process payment (mock)
      const paymentResult = await this.processPayment(totalAmount, cart.currency);
      
      if (!paymentResult.success) {
        return {
          orderId: '',
          status: 'failed',
          message: 'Payment failed: ' + paymentResult.error,
          totalAmount,
          currency: cart.currency
        };
      }

      // Step 4: Create order (mock)
      const order = await this.createOrder({
        customerId: cart.customerId,
        items: validatedItems,
        currency: cart.currency,
        paymentId: paymentResult.paymentId
      });

      // Step 5: Reserve inventory (mock)
      await this.reserveInventory(validatedItems);

      // Step 6: Send confirmation (mock)
      await this.sendOrderConfirmation(order.id, cart.customerId);

      console.log('✅ Checkout completed successfully for order:', order.id);

      return {
        orderId: order.id,
        status: 'success',
        message: 'Checkout completed successfully',
        totalAmount,
        currency: cart.currency
      };

    } catch (error) {
      console.error('❌ Checkout failed:', error);
      
      return {
        orderId: '',
        status: 'failed',
        message: 'Checkout failed: ' + (error as Error).message,
        totalAmount: 0,
        currency: cart.currency
      };
    }
  }

  private async validateCartItems(items: CartItem[]) {
    const validatedItems = [];

    for (const item of items) {
      // Mock product validation - in real implementation would call catalog service
      const product = {
        id: item.productId,
        name: `Product ${item.productId}`,
        price: 299, // Mock price
        currency: 'SEK'
      };

      validatedItems.push({
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        currency: product.currency
      });
    }

    return validatedItems;
  }

  private calculateTotal(items: any[]): number {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  private async processPayment(amount: number, currency: string) {
    // Mock payment processing
    console.log(`💳 Processing payment: ${amount} ${currency}`);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock success (90% success rate)
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        paymentId: `pay_${Date.now()}`,
        amount,
        currency
      };
    } else {
      return {
        success: false,
        error: 'Payment declined'
      };
    }
  }

  private async reserveInventory(items: any[]) {
    // Mock inventory reservation
    console.log('📦 Reserving inventory for items:', items.length);
    
    // Simulate inventory check delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For now, assume all items are in stock
    console.log('✅ Inventory reserved successfully');
  }

  private async createOrder(orderData: any) {
    // Mock order creation - in real implementation would call orders service
    console.log('📝 Creating order for customer:', orderData.customerId);
    
    // Simulate order creation delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const order = {
      id: `order_${Date.now()}`,
      customerId: orderData.customerId,
      items: orderData.items,
      currency: orderData.currency,
      paymentId: orderData.paymentId,
      status: 'created',
      createdAt: new Date().toISOString()
    };
    
    console.log('✅ Order created:', order.id);
    return order;
  }

  private async sendOrderConfirmation(orderId: string, customerId: string) {
    // Mock order confirmation
    console.log(`📧 Sending order confirmation for order ${orderId} to customer ${customerId}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('✅ Order confirmation sent');
  }
}