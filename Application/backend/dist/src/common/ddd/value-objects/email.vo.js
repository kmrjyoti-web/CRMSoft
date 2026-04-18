"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const value_object_1 = require("../value-object");
const result_1 = require("../../result/result");
class Email extends value_object_1.ValueObject {
    constructor(props) {
        super(props);
    }
    static create(value) {
        if (!value) {
            return result_1.Result.fail('EMAIL_001');
        }
        const normalized = value.trim().toLowerCase();
        if (!Email.PATTERN.test(normalized)) {
            return result_1.Result.fail('EMAIL_002', { email: value });
        }
        return result_1.Result.ok(new Email({ value: normalized }));
    }
    get value() {
        return this.props.value;
    }
    get domain() {
        return this.props.value.split('@')[1] ?? '';
    }
}
exports.Email = Email;
Email.PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//# sourceMappingURL=email.vo.js.map