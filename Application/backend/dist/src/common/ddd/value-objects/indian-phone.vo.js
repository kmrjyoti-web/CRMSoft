"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndianPhone = void 0;
const value_object_1 = require("../value-object");
const result_1 = require("../../result/result");
class IndianPhone extends value_object_1.ValueObject {
    constructor(props) {
        super(props);
    }
    static create(value) {
        if (!value) {
            return result_1.Result.fail('PHONE_001');
        }
        const cleaned = value.replace(/[\s\-\(\)]/g, '').replace(/^\+?91/, '');
        if (!IndianPhone.PATTERN.test(cleaned)) {
            return result_1.Result.fail('PHONE_002', { phone: value });
        }
        return result_1.Result.ok(new IndianPhone({ value: cleaned }));
    }
    get value() {
        return this.props.value;
    }
    get formatted() {
        return `+91 ${this.props.value.slice(0, 5)} ${this.props.value.slice(5)}`;
    }
    get withCountryCode() {
        return `+91${this.props.value}`;
    }
}
exports.IndianPhone = IndianPhone;
IndianPhone.PATTERN = /^[6-9]\d{9}$/;
//# sourceMappingURL=indian-phone.vo.js.map