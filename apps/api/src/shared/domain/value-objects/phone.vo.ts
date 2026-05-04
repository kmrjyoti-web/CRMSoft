/**
 * Phone Value Object - Validates phone number.
 */
export class Phone {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value.trim();
  }

  static create(value: string): Phone {
    if (!value || !value.trim()) {
      throw new Error('Phone cannot be empty');
    }
    const cleaned = value.replace(/[\s\-().]/g, '');
    if (cleaned.length < 7 || cleaned.length > 15) {
      throw new Error(`Invalid phone number length: ${value}`);
    }
    return new Phone(value.trim());
  }

  static createOptional(value?: string): Phone | undefined {
    if (!value || !value.trim()) return undefined;
    return Phone.create(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Phone): boolean {
    return this._value === other._value;
  }
}

