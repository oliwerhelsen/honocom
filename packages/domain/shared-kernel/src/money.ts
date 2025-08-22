import { ValueObject } from "./value-object";

interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  constructor(amount: number, currency: string = "SEK") {
    if (amount < 0) {
      throw new Error("Money amount cannot be negative");
    }

    super({
      amount: Math.round(amount * 100) / 100, // Round to 2 decimals
      currency: currency.toUpperCase(),
    });
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error("Money subtraction cannot result in negative amount");
    }
    return new Money(result, this.currency);
  }

  multiply(multiplier: number): Money {
    return new Money(this.amount * multiplier, this.currency);
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Cannot perform operation on different currencies: ${this.currency} and ${other.currency}`
      );
    }
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }
}
