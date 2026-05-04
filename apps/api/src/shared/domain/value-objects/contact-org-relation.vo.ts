export class ContactOrgRelation {
  private constructor(private readonly _value: string) {}
  get value(): string { return this._value; }

  static readonly PRIMARY_CONTACT = new ContactOrgRelation('PRIMARY_CONTACT');
  static readonly EMPLOYEE = new ContactOrgRelation('EMPLOYEE');
  static readonly CONSULTANT = new ContactOrgRelation('CONSULTANT');
  static readonly PARTNER = new ContactOrgRelation('PARTNER');
  static readonly VENDOR = new ContactOrgRelation('VENDOR');
  static readonly DIRECTOR = new ContactOrgRelation('DIRECTOR');
  static readonly FOUNDER = new ContactOrgRelation('FOUNDER');

  private static readonly ALL = [
    'PRIMARY_CONTACT', 'EMPLOYEE', 'CONSULTANT', 'PARTNER',
    'VENDOR', 'DIRECTOR', 'FOUNDER',
  ];

  static fromString(s: string): ContactOrgRelation {
    if (!ContactOrgRelation.ALL.includes(s)) {
      throw new Error(`Invalid relation type: ${s}. Valid: ${ContactOrgRelation.ALL.join(', ')}`);
    }
    return new ContactOrgRelation(s);
  }

  isPrimaryContact(): boolean { return this._value === 'PRIMARY_CONTACT'; }
  equals(other: ContactOrgRelation): boolean { return this._value === other._value; }
  toString(): string { return this._value; }
}
