"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactLinkedToOrgEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class ContactLinkedToOrgEvent extends domain_event_1.DomainEvent {
    constructor(mappingId, contactId, organizationId, relationType) {
        super(mappingId, 'ContactLinkedToOrg');
        this.mappingId = mappingId;
        this.contactId = contactId;
        this.organizationId = organizationId;
        this.relationType = relationType;
    }
}
exports.ContactLinkedToOrgEvent = ContactLinkedToOrgEvent;
//# sourceMappingURL=contact-linked-to-org.event.js.map