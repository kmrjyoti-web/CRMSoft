"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
const value_object_1 = require("../value-object");
const result_1 = require("../../result/result");
class Money extends value_object_1.ValueObject {
    constructor(props) {
        super(props);
    }
    static create(amount, currency = 'INR') {
        if (isNaN(amount) || !isFinite(amount)) {
            return result_1.Result.fail('MONEY_001', { field: 'amount' });
        }
        if (amount < 0) {
            return result_1.Result.fail('MONEY_002', { field: 'amount' });
        }
        return result_1.Result.ok(new Money({ amountInPaisa: Math.round(amount * 100), currency }));
    }
    static fromPaisa(paisa, currency = 'INR') {
        if (!Number.isInteger(paisa) || paisa < 0) {
            return result_1.Result.fail('MONEY_001', { field: 'paisa' });
        }
        return result_1.Result.ok(new Money({ amountInPaisa: paisa, currency }));
    }
    static zero(currency = 'INR') {
        return new Money({ amountInPaisa: 0, currency });
    }
    get amount() {
        return this.props.amountInPaisa / 100;
    }
    get amountInPaisa() {
        return this.props.amountInPaisa;
    }
    get currency() {
        return this.props.currency;
    }
    add(other) {
        return new Money({
            amountInPaisa: this.props.amountInPaisa + other.props.amountInPaisa,
            currency: this.props.currency,
        });
    }
    subtract(other) {
        const result = this.props.amountInPaisa - other.props.amountInPaisa;
        if (result < 0) {
            return result_1.Result.fail('MONEY_003');
        }
        return result_1.Result.ok(new Money({ amountInPaisa: result, currency: this.props.currency }));
    }
    multiply(factor) {
        return new Money({
            amountInPaisa: Math.round(this.props.amountInPaisa * factor),
            currency: this.props.currency,
        });
    }
    applyGST(ratePercent) {
        const gstPaisa = Math.round(this.props.amountInPaisa * (ratePercent / 100));
        return {
            base: this,
            gst: new Money({ amountInPaisa: gstPaisa, currency: this.props.currency }),
            total: new Money({ amountInPaisa: this.props.amountInPaisa + gstPaisa, currency: this.props.currency }),
        };
    }
    formatINR() {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(this.amount);
    }
}
exports.Money = Money;
//# sourceMappingURL=money.vo.js.map