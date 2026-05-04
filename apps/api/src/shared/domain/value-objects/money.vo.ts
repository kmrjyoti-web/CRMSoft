/**
 * Money Value Object - Represents a monetary amount.
 * Immutable. Use for expectedValue, quotation amounts, etc.
 */
export class Money {
  private constructor(
    private readonly _amount: number,
    private readonly _currency: string = 'INR',
  ) {
    if (_amount < 0) throw new Error('Money amount cannot be negative');
  }

  static create(amount: number, currency = 'INR'): Money {
    return new Money(amount, currency);
  }

  static zero(currency = 'INR'): Money {
    return new Money(0, currency);
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): string {
    return this._currency;
  }

  add(other: Money): Money {
    if (this._currency !== other._currency) throw new Error('Cannot add different currencies');
    return new Money(this._amount + other._amount, this._currency);
  }

  subtract(other: Money): Money {
    if (this._currency !== other._currency) throw new Error('Cannot subtract different currencies');
    return new Money(this._amount - other._amount, this._currency);
  }

  multiply(factor: number): Money {
    return new Money(this._amount * factor, this._currency);
  }

  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  isZero(): boolean {
    return this._amount === 0;
  }

  isGreaterThan(other: Money): boolean {
    return this._amount > other._amount;
  }
}

