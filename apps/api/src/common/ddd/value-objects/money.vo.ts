import { ValueObject } from '../value-object';
import { Result } from '../../result/result';

interface MoneyProps {
  /** Stored in paisa (smallest unit) to avoid floating-point errors. */
  amountInPaisa: number;
  currency: string;
}

/**
 * Money — immutable value object for INR amounts.
 * Stores internally in paisa to avoid floating-point arithmetic errors.
 */
export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  static create(amount: number, currency = 'INR'): Result<Money> {
    if (isNaN(amount) || !isFinite(amount)) {
      return Result.fail('MONEY_001', { field: 'amount' });
    }
    if (amount < 0) {
      return Result.fail('MONEY_002', { field: 'amount' });
    }
    return Result.ok(new Money({ amountInPaisa: Math.round(amount * 100), currency }));
  }

  static fromPaisa(paisa: number, currency = 'INR'): Result<Money> {
    if (!Number.isInteger(paisa) || paisa < 0) {
      return Result.fail('MONEY_001', { field: 'paisa' });
    }
    return Result.ok(new Money({ amountInPaisa: paisa, currency }));
  }

  static zero(currency = 'INR'): Money {
    return new Money({ amountInPaisa: 0, currency });
  }

  get amount(): number {
    return this.props.amountInPaisa / 100;
  }

  get amountInPaisa(): number {
    return this.props.amountInPaisa;
  }

  get currency(): string {
    return this.props.currency;
  }

  add(other: Money): Money {
    return new Money({
      amountInPaisa: this.props.amountInPaisa + other.props.amountInPaisa,
      currency: this.props.currency,
    });
  }

  subtract(other: Money): Result<Money> {
    const result = this.props.amountInPaisa - other.props.amountInPaisa;
    if (result < 0) {
      return Result.fail('MONEY_003');
    }
    return Result.ok(new Money({ amountInPaisa: result, currency: this.props.currency }));
  }

  multiply(factor: number): Money {
    return new Money({
      amountInPaisa: Math.round(this.props.amountInPaisa * factor),
      currency: this.props.currency,
    });
  }

  applyGST(ratePercent: number): { base: Money; gst: Money; total: Money } {
    const gstPaisa = Math.round(this.props.amountInPaisa * (ratePercent / 100));
    return {
      base: this,
      gst: new Money({ amountInPaisa: gstPaisa, currency: this.props.currency }),
      total: new Money({ amountInPaisa: this.props.amountInPaisa + gstPaisa, currency: this.props.currency }),
    };
  }

  formatINR(): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(this.amount);
  }
}
