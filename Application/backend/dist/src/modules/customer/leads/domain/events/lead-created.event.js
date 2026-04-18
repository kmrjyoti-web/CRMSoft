"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadCreatedEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class LeadCreatedEvent extends domain_event_1.DomainEvent {
    constructor(leadId, contactId, createdById) {
        super(leadId, 'LeadCreated');
        this.leadId = leadId;
        this.contactId = contactId;
        this.createdById = createdById;
    }
}
exports.LeadCreatedEvent = LeadCreatedEvent;
//# sourceMappingURL=lead-created.event.js.map