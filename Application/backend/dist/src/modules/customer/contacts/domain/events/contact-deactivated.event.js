"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactDeactivatedEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class ContactDeactivatedEvent extends domain_event_1.DomainEvent {
    constructor(contactId, firstName, lastName) {
        super(contactId, 'ContactDeactivated');
        this.contactId = contactId;
        this.firstName = firstName;
        this.lastName = lastName;
    }
}
exports.ContactDeactivatedEvent = ContactDeactivatedEvent;
//# sourceMappingURL=contact-deactivated.event.js.map