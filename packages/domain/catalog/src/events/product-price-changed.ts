import { BaseDomainEvent, Money } from "@domain/shared-kernel";
import { ProductId } from "../value-object/product-id";

export class ProductPriceChanged extends BaseDomainEvent {
  constructor(
    public readonly productId: ProductId,
    public readonly previousPrice: Money,
    public readonly newPrice: Money
  ) {
    super("ProductPriceChanged");
  }
}
