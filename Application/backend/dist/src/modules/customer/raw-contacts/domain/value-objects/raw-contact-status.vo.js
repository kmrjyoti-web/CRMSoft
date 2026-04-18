"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawContactStatus = void 0;
class RawContactStatus {
    constructor(_value) {
        this._value = _value;
    }
    get value() { return this._value; }
    static fromString(s) {
        if (!RawContactStatus.ALL.includes(s)) {
            throw new Error(`Invalid raw contact status: ${s}`);
        }
        return new RawContactStatus(s);
    }
    canTransitionTo(target) {
        const allowed = RawContactStatus.VALID_TRANSITIONS[this._value] || [];
        return allowed.includes(target._value);
    }
    isTerminal() {
        return this._value === 'VERIFIED' || this._value === 'DUPLICATE';
    }
    isRaw() { return this._value === 'RAW'; }
    isVerified() { return this._value === 'VERIFIED'; }
    equals(other) { return this._value === other._value; }
    toString() { return this._value; }
}
exports.RawContactStatus = RawContactStatus;
RawContactStatus.RAW = new RawContactStatus('RAW');
RawContactStatus.VERIFIED = new RawContactStatus('VERIFIED');
RawContactStatus.REJECTED = new RawContactStatus('REJECTED');
RawContactStatus.DUPLICATE = new RawContactStatus('DUPLICATE');
RawContactStatus.ALL = ['RAW', 'VERIFIED', 'REJECTED', 'DUPLICATE'];
RawContactStatus.VALID_TRANSITIONS = {
    RAW: ['VERIFIED', 'REJECTED', 'DUPLICATE'],
    VERIFIED: [],
    REJECTED: ['RAW'],
    DUPLICATE: [],
};
//# sourceMappingURL=raw-contact-status.vo.js.map