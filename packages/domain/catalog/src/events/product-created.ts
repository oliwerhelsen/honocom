import { BaseDomainEvent } from "@domain/shared-kernel";
import { ProductId } from "../value-object/product-id";

export class ProductCreated extends BaseDomainEvent {
  constructor(
    public readonly productId: ProductId,
    public readonly name: string,
    public readonly categoryId?: string
  ) {
    super("ProductCreated");
  }
}
