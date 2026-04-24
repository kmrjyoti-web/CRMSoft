export class RawContactStatus {
  private constructor(private readonly _value: string) {}
  get value(): string { return this._value; }

  static readonly RAW = new RawContactStatus('RAW');
  static readonly VERIFIED = new RawContactStatus('VERIFIED');
  static readonly REJECTED = new RawContactStatus('REJECTED');
  static readonly DUPLICATE = new RawContactStatus('DUPLICATE');

  private static readonly ALL = ['RAW', 'VERIFIED', 'REJECTED', 'DUPLICATE'];

  private static readonly VALID_TRANSITIONS: Record<string, string[]> = {
    RAW:       ['VERIFIED', 'REJECTED', 'DUPLICATE'],
    VERIFIED:  [],  // terminal
    REJECTED:  ['RAW'],  // can re-open
    DUPLICATE: [],  // terminal
  };

  static fromString(s: string): RawContactStatus {
    if (!RawContactStatus.ALL.includes(s)) {
      throw new Error(`Invalid raw contact status: ${s}`);
    }
    return new RawContactStatus(s);
  }

  canTransitionTo(target: RawContactStatus): boolean {
    const allowed = RawContactStatus.VALID_TRANSITIONS[this._value] || [];
    return allowed.includes(target._value);
  }

  isTerminal(): boolean {
    return this._value === 'VERIFIED' || this._value === 'DUPLICATE';
  }

  isRaw(): boolean { return this._value === 'RAW'; }
  isVerified(): boolean { return this._value === 'VERIFIED'; }
  equals(other: RawContactStatus): boolean { return this._value === other._value; }
  toString(): string { return this._value; }
}
