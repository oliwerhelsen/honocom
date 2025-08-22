import { ValueObject } from "@domain/shared-kernel";

interface ProductNameProps {
  value: string;
}

export class ProductName extends ValueObject<ProductNameProps> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Product name cannot be empty");
    }

    if (value.length > 255) {
      throw new Error("Product name cannot exceed 255 characters");
    }

    super({ value: value.trim() });
  }

  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}
