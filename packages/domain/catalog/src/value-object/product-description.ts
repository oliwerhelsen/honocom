import { ValueObject } from "@domain/shared-kernel";

interface ProductDescriptionProps {
  value: string;
}

export class ProductDescription extends ValueObject<ProductDescriptionProps> {
  constructor(value: string) {
    if (value && value.length > 5000) {
      throw new Error("Product description cannot exceed 5000 characters");
    }

    super({ value: value?.trim() || "" });
  }

  get value(): string {
    return this.props.value;
  }

  get isEmpty(): boolean {
    return this.props.value.length === 0;
  }

  toString(): string {
    return this.props.value;
  }
}
