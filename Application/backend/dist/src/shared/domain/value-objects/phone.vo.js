"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phone = void 0;
class Phone {
    constructor(value) {
        this._value = value.trim();
    }
    static create(value) {
        if (!value || !value.trim()) {
            throw new Error('Phone cannot be empty');
        }
        const cleaned = value.replace(/[\s\-().]/g, '');
        if (cleaned.length < 7 || cleaned.length > 15) {
            throw new Error(`Invalid phone number length: ${value}`);
        }
        return new Phone(value.trim());
    }
    static createOptional(value) {
        if (!value || !value.trim())
            return undefined;
        return Phone.create(value);
    }
    get value() {
        return this._value;
    }
    equals(other) {
        return this._value === other._value;
    }
}
exports.Phone = Phone;
//# sourceMappingURL=phone.vo.js.map