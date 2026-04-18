"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadStatusChangedEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class LeadStatusChangedEvent extends domain_event_1.DomainEvent {
    constructor(leadId, fromStatus, toStatus) {
        super(leadId, 'LeadStatusChanged');
        this.leadId = leadId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
    }
}
exports.LeadStatusChangedEvent = LeadStatusChangedEvent;
//# sourceMappingURL=lead-status-changed.event.js.map