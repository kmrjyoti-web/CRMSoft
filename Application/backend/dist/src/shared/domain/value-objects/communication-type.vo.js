"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationType = void 0;
class CommunicationType {
    constructor(_value) {
        this._value = _value;
    }
    get value() { return this._value; }
    static fromString(s) {
        if (!CommunicationType.ALL.includes(s)) {
            throw new Error(`Invalid communication type: ${s}. Valid: ${CommunicationType.ALL.join(', ')}`);
        }
        return new CommunicationType(s);
    }
    isPhone() { return this._value === 'PHONE' || this._value === 'MOBILE'; }
    isEmail() { return this._value === 'EMAIL'; }
    isAddress() { return this._value === 'ADDRESS'; }
    equals(other) { return this._value === other._value; }
    toString() { return this._value; }
}
exports.CommunicationType = CommunicationType;
CommunicationType.PHONE = new CommunicationType('PHONE');
CommunicationType.EMAIL = new CommunicationType('EMAIL');
CommunicationType.MOBILE = new CommunicationType('MOBILE');
CommunicationType.ADDRESS = new CommunicationType('ADDRESS');
CommunicationType.WHATSAPP = new CommunicationType('WHATSAPP');
CommunicationType.ALL = ['PHONE', 'EMAIL', 'MOBILE', 'ADDRESS', 'WHATSAPP'];
//# sourceMappingURL=communication-type.vo.js.map