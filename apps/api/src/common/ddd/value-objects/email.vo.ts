import { ValueObject } from '../value-object';
import { Result } from '../../result/result';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private static readonly PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(props: EmailProps) {
    super(props);
  }

  static create(value: string): Result<Email> {
    if (!value) {
      return Result.fail('EMAIL_001');
    }
    const normalized = value.trim().toLowerCase();
    if (!Email.PATTERN.test(normalized)) {
      return Result.fail('EMAIL_002', { email: value });
    }
    return Result.ok(new Email({ value: normalized }));
  }

  get value(): string {
    return this.props.value;
  }

  get domain(): string {
    return this.props.value.split('@')[1] ?? '';
  }
}
