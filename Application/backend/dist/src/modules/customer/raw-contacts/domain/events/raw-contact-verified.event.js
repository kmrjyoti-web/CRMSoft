"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawContactVerifiedEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class RawContactVerifiedEvent extends domain_event_1.DomainEvent {
    constructor(rawContactId, contactId, verifiedById, companyName) {
        super(rawContactId, 'RawContactVerified');
        this.rawContactId = rawContactId;
        this.contactId = contactId;
        this.verifiedById = verifiedById;
        this.companyName = companyName;
    }
}
exports.RawContactVerifiedEvent = RawContactVerifiedEvent;
//# sourceMappingURL=raw-contact-verified.event.js.map