export class PriorityType {
  private constructor(private readonly _value: string) {}
  get value(): string { return this._value; }

  static readonly PRIMARY = new PriorityType('PRIMARY');
  static readonly WORK = new PriorityType('WORK');
  static readonly HOME = new PriorityType('HOME');
  static readonly PERSONAL = new PriorityType('PERSONAL');
  static readonly OTHER = new PriorityType('OTHER');

  private static readonly ALL = ['PRIMARY', 'WORK', 'HOME', 'PERSONAL', 'OTHER'];

  static fromString(s: string): PriorityType {
    if (!PriorityType.ALL.includes(s)) {
      throw new Error(`Invalid priority type: ${s}. Valid: ${PriorityType.ALL.join(', ')}`);
    }
    return new PriorityType(s);
  }

  isPrimary(): boolean { return this._value === 'PRIMARY'; }
  equals(other: PriorityType): boolean { return this._value === other._value; }
  toString(): string { return this._value; }
}
