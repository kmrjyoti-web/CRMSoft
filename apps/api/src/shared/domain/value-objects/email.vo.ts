/**
 * Email Value Object - Validates email format.
 * Immutable: create new instance to change.
 */
export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value.toLowerCase().trim();
  }

  static create(value: string): Email {
    const trimmed = value?.trim();
    if (!trimmed) {
      throw new Error('Email cannot be empty');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      throw new Error(`Invalid email format: ${trimmed}`);
    }
    return new Email(trimmed);
  }

  static createOptional(value?: string): Email | undefined {
    if (!value || !value.trim()) return undefined;
    return Email.create(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}

