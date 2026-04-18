"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactOrgRelation = void 0;
class ContactOrgRelation {
    constructor(_value) {
        this._value = _value;
    }
    get value() { return this._value; }
    static fromString(s) {
        if (!ContactOrgRelation.ALL.includes(s)) {
            throw new Error(`Invalid relation type: ${s}. Valid: ${ContactOrgRelation.ALL.join(', ')}`);
        }
        return new ContactOrgRelation(s);
    }
    isPrimaryContact() { return this._value === 'PRIMARY_CONTACT'; }
    equals(other) { return this._value === other._value; }
    toString() { return this._value; }
}
exports.ContactOrgRelation = ContactOrgRelation;
ContactOrgRelation.PRIMARY_CONTACT = new ContactOrgRelation('PRIMARY_CONTACT');
ContactOrgRelation.EMPLOYEE = new ContactOrgRelation('EMPLOYEE');
ContactOrgRelation.CONSULTANT = new ContactOrgRelation('CONSULTANT');
ContactOrgRelation.PARTNER = new ContactOrgRelation('PARTNER');
ContactOrgRelation.VENDOR = new ContactOrgRelation('VENDOR');
ContactOrgRelation.DIRECTOR = new ContactOrgRelation('DIRECTOR');
ContactOrgRelation.FOUNDER = new ContactOrgRelation('FOUNDER');
ContactOrgRelation.ALL = [
    'PRIMARY_CONTACT', 'EMPLOYEE', 'CONSULTANT', 'PARTNER',
    'VENDOR', 'DIRECTOR', 'FOUNDER',
];
//# sourceMappingURL=contact-org-relation.vo.js.map