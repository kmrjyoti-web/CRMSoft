"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
class Money {
    constructor(_amount, _currency = 'INR') {
        this._amount = _amount;
        this._currency = _currency;
        if (_amount < 0)
            throw new Error('Money amount cannot be negative');
    }
    static create(amount, currency = 'INR') {
        return new Money(amount, currency);
    }
    static zero(currency = 'INR') {
        return new Money(0, currency);
    }
    get amount() {
        return this._amount;
    }
    get currency() {
        return this._currency;
    }
    add(other) {
        if (this._currency !== other._currency)
            throw new Error('Cannot add different currencies');
        return new Money(this._amount + other._amount, this._currency);
    }
    subtract(other) {
        if (this._currency !== other._currency)
            throw new Error('Cannot subtract different currencies');
        return new Money(this._amount - other._amount, this._currency);
    }
    multiply(factor) {
        return new Money(this._amount * factor, this._currency);
    }
    equals(other) {
        return this._amount === other._amount && this._currency === other._currency;
    }
    isZero() {
        return this._amount === 0;
    }
    isGreaterThan(other) {
        return this._amount > other._amount;
    }
}
exports.Money = Money;
//# sourceMappingURL=money.vo.js.map