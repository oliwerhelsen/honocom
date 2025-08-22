import { EntityId } from "@domain/shared-kernel";

export class ProductId extends EntityId {
  static create(value?: string): ProductId {
    return new ProductId(value);
  }

  static fromString(value: string): ProductId {
    return new ProductId(value);
  }
}
