"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactUpdatedEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class ContactUpdatedEvent extends domain_event_1.DomainEvent {
    constructor(contactId, changedFields, updatedById) {
        super(contactId, 'ContactUpdated');
        this.contactId = contactId;
        this.changedFields = changedFields;
        this.updatedById = updatedById;
    }
}
exports.ContactUpdatedEvent = ContactUpdatedEvent;
//# sourceMappingURL=contact-updated.event.js.map