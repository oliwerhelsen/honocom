import { injectable, inject } from 'inversify';
import { CheckoutWorkflow, Cart, CheckoutResult } from '../workflows/checkout.workflow';

@injectable()
export class CheckoutService {
  constructor(
    @inject('CheckoutWorkflow') private checkoutWorkflow: CheckoutWorkflow
  ) {}

  async processCheckout(cart: Cart): Promise<CheckoutResult> {
    // Validate cart
    this.validateCart(cart);
    
    // Process checkout through workflow
    return await this.checkoutWorkflow.processCheckout(cart);
  }

  async getCheckoutSummary(cart: Cart) {
    this.validateCart(cart);
    
    // Mock summary calculation
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const estimatedTotal = itemCount * 500; // Mock calculation
    
    return {
      customerId: cart.customerId,
      itemCount,
      estimatedTotal,
      currency: cart.currency,
      taxAmount: Math.round(estimatedTotal * 0.25), // 25% VAT
      shippingCost: itemCount > 5 ? 0 : 99, // Free shipping over 5 items
    };
  }

  private validateCart(cart: Cart): void {
    if (!cart.customerId) {
      throw new Error('Customer ID is required');
    }

    if (!cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    if (!cart.currency) {
      throw new Error('Currency is required');
    }

    // Validate each item
    for (const item of cart.items) {
      if (!item.productId) {
        throw new Error('Product ID is required for all items');
      }
      
      if (!item.quantity || item.quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
    }
  }
}