"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueObject = void 0;
class ValueObject {
    constructor(props) {
        this.props = Object.freeze(props);
    }
    equals(other) {
        return JSON.stringify(this.props) === JSON.stringify(other.props);
    }
}
exports.ValueObject = ValueObject;
//# sourceMappingURL=value-object.js.map