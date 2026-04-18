"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
class Email {
    constructor(value) {
        this._value = value.toLowerCase().trim();
    }
    static create(value) {
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
    static createOptional(value) {
        if (!value || !value.trim())
            return undefined;
        return Email.create(value);
    }
    get value() {
        return this._value;
    }
    equals(other) {
        return this._value === other._value;
    }
    toString() {
        return this._value;
    }
}
exports.Email = Email;
//# sourceMappingURL=email.vo.js.map