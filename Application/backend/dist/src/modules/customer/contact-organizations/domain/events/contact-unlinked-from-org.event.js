"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactUnlinkedFromOrgEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class ContactUnlinkedFromOrgEvent extends domain_event_1.DomainEvent {
    constructor(mappingId, contactId, organizationId) {
        super(mappingId, 'ContactUnlinkedFromOrg');
        this.mappingId = mappingId;
        this.contactId = contactId;
        this.organizationId = organizationId;
    }
}
exports.ContactUnlinkedFromOrgEvent = ContactUnlinkedFromOrgEvent;
//# sourceMappingURL=contact-unlinked-from-org.event.js.map