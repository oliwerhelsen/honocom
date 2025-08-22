import { EntityId } from "@domain/shared-kernel";

export class CategoryId extends EntityId {
  static create(value?: string): CategoryId {
    return new CategoryId(value);
  }

  static fromString(value: string): CategoryId {
    return new CategoryId(value);
  }
}
