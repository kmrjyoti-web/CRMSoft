export class CommunicationType {
  private constructor(private readonly _value: string) {}
  get value(): string { return this._value; }

  static readonly PHONE = new CommunicationType('PHONE');
  static readonly EMAIL = new CommunicationType('EMAIL');
  static readonly MOBILE = new CommunicationType('MOBILE');
  static readonly ADDRESS = new CommunicationType('ADDRESS');
  static readonly WHATSAPP = new CommunicationType('WHATSAPP');

  private static readonly ALL = ['PHONE', 'EMAIL', 'MOBILE', 'ADDRESS', 'WHATSAPP'];

  static fromString(s: string): CommunicationType {
    if (!CommunicationType.ALL.includes(s)) {
      throw new Error(`Invalid communication type: ${s}. Valid: ${CommunicationType.ALL.join(', ')}`);
    }
    return new CommunicationType(s);
  }

  isPhone(): boolean { return this._value === 'PHONE' || this._value === 'MOBILE'; }
  isEmail(): boolean { return this._value === 'EMAIL'; }
  isAddress(): boolean { return this._value === 'ADDRESS'; }
  equals(other: CommunicationType): boolean { return this._value === other._value; }
  toString(): string { return this._value; }
}
