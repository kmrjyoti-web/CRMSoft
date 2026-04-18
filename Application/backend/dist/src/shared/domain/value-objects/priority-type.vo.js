"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityType = void 0;
class PriorityType {
    constructor(_value) {
        this._value = _value;
    }
    get value() { return this._value; }
    static fromString(s) {
        if (!PriorityType.ALL.includes(s)) {
            throw new Error(`Invalid priority type: ${s}. Valid: ${PriorityType.ALL.join(', ')}`);
        }
        return new PriorityType(s);
    }
    isPrimary() { return this._value === 'PRIMARY'; }
    equals(other) { return this._value === other._value; }
    toString() { return this._value; }
}
exports.PriorityType = PriorityType;
PriorityType.PRIMARY = new PriorityType('PRIMARY');
PriorityType.WORK = new PriorityType('WORK');
PriorityType.HOME = new PriorityType('HOME');
PriorityType.PERSONAL = new PriorityType('PERSONAL');
PriorityType.OTHER = new PriorityType('OTHER');
PriorityType.ALL = ['PRIMARY', 'WORK', 'HOME', 'PERSONAL', 'OTHER'];
//# sourceMappingURL=priority-type.vo.js.map