import { ValueObject } from '../value-object';
import { Result } from '../../result/result';

interface PhoneProps {
  value: string; // Stored as 10-digit cleaned number
}

/**
 * IndianPhone — mobile number value object for the Indian market.
 * Valid: 10 digits starting with 6-9 (post-liberalisation numbering plan).
 */
export class IndianPhone extends ValueObject<PhoneProps> {
  private static readonly PATTERN = /^[6-9]\d{9}$/;

  private constructor(props: PhoneProps) {
    super(props);
  }

  static create(value: string): Result<IndianPhone> {
    if (!value) {
      return Result.fail('PHONE_001');
    }
    // Strip spaces, dashes, +91 country code prefix
    const cleaned = value.replace(/[\s\-\(\)]/g, '').replace(/^\+?91/, '');
    if (!IndianPhone.PATTERN.test(cleaned)) {
      return Result.fail('PHONE_002', { phone: value });
    }
    return Result.ok(new IndianPhone({ value: cleaned }));
  }

  get value(): string {
    return this.props.value;
  }

  get formatted(): string {
    return `+91 ${this.props.value.slice(0, 5)} ${this.props.value.slice(5)}`;
  }

  get withCountryCode(): string {
    return `+91${this.props.value}`;
  }
}
