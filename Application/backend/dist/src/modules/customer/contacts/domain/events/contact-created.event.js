"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactCreatedEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class ContactCreatedEvent extends domain_event_1.DomainEvent {
    constructor(contactId, firstName, lastName, createdById) {
        super(contactId, 'ContactCreated');
        this.contactId = contactId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.createdById = createdById;
    }
}
exports.ContactCreatedEvent = ContactCreatedEvent;
//# sourceMappingURL=contact-created.event.js.map