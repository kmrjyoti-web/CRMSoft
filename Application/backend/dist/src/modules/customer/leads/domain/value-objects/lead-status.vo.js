"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadStatus = void 0;
const VALID_TRANSITIONS = {
    NEW: ['VERIFIED', 'LOST'],
    VERIFIED: ['ALLOCATED', 'LOST'],
    ALLOCATED: ['IN_PROGRESS', 'LOST', 'ON_HOLD'],
    IN_PROGRESS: ['DEMO_SCHEDULED', 'QUOTATION_SENT', 'LOST', 'ON_HOLD'],
    DEMO_SCHEDULED: ['IN_PROGRESS', 'QUOTATION_SENT', 'LOST', 'ON_HOLD'],
    QUOTATION_SENT: ['NEGOTIATION', 'WON', 'LOST', 'ON_HOLD'],
    NEGOTIATION: ['WON', 'LOST', 'QUOTATION_SENT', 'ON_HOLD'],
    ON_HOLD: ['IN_PROGRESS', 'ALLOCATED', 'LOST'],
    WON: [],
    LOST: [],
};
const ALL_STATUSES = Object.keys(VALID_TRANSITIONS);
class LeadStatus {
    constructor(_value) {
        this._value = _value;
    }
    get value() { return this._value; }
    static fromString(s) {
        if (!ALL_STATUSES.includes(s)) {
            throw new Error(`Invalid lead status: ${s}. Valid: ${ALL_STATUSES.join(', ')}`);
        }
        return new LeadStatus(s);
    }
    canTransitionTo(target) {
        return VALID_TRANSITIONS[this._value]?.includes(target.value) ?? false;
    }
    validTransitions() {
        return VALID_TRANSITIONS[this._value] || [];
    }
    isTerminal() { return ['WON', 'LOST'].includes(this._value); }
    isActive() { return !this.isTerminal(); }
    equals(other) { return this._value === other._value; }
    toString() { return this._value; }
}
exports.LeadStatus = LeadStatus;
LeadStatus.NEW = new LeadStatus('NEW');
LeadStatus.VERIFIED = new LeadStatus('VERIFIED');
LeadStatus.ALLOCATED = new LeadStatus('ALLOCATED');
LeadStatus.IN_PROGRESS = new LeadStatus('IN_PROGRESS');
LeadStatus.DEMO_SCHEDULED = new LeadStatus('DEMO_SCHEDULED');
LeadStatus.QUOTATION_SENT = new LeadStatus('QUOTATION_SENT');
LeadStatus.NEGOTIATION = new LeadStatus('NEGOTIATION');
LeadStatus.WON = new LeadStatus('WON');
LeadStatus.LOST = new LeadStatus('LOST');
LeadStatus.ON_HOLD = new LeadStatus('ON_HOLD');
//# sourceMappingURL=lead-status.vo.js.map