import { Money, ValueObject } from "@domain/shared-kernel";

interface ProductPriceProps {
  listPrice: Money;
  salePrice?: Money;
}

export class ProductPrice extends ValueObject<ProductPriceProps> {
  constructor(listPrice: Money, salePrice?: Money) {
    if (salePrice && salePrice.amount > listPrice.amount) {
      throw new Error("Sale price cannot be higher than list price");
    }

    super({ listPrice, salePrice });
  }

  get listPrice(): Money {
    return this.props.listPrice;
  }

  get salePrice(): Money | undefined {
    return this.props.salePrice;
  }

  get effectivePrice(): Money {
    return this.props.salePrice || this.props.listPrice;
  }

  get isOnSale(): boolean {
    return !!this.props.salePrice;
  }

  get discountAmount(): Money | undefined {
    if (!this.props.salePrice) return undefined;
    return this.props.listPrice.subtract(this.props.salePrice);
  }

  get discountPercentage(): number | undefined {
    if (!this.props.salePrice) return undefined;
    return Math.round(
      ((this.props.listPrice.amount - this.props.salePrice.amount) /
        this.props.listPrice.amount) *
        100
    );
  }
}
