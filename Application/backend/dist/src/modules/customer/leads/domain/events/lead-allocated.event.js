"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadAllocatedEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class LeadAllocatedEvent extends domain_event_1.DomainEvent {
    constructor(leadId, allocatedToId, contactId) {
        super(leadId, 'LeadAllocated');
        this.leadId = leadId;
        this.allocatedToId = allocatedToId;
        this.contactId = contactId;
    }
}
exports.LeadAllocatedEvent = LeadAllocatedEvent;
//# sourceMappingURL=lead-allocated.event.js.map