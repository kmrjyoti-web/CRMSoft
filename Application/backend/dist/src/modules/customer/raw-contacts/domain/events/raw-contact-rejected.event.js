"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawContactRejectedEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class RawContactRejectedEvent extends domain_event_1.DomainEvent {
    constructor(rawContactId, reason) {
        super(rawContactId, 'RawContactRejected');
        this.rawContactId = rawContactId;
        this.reason = reason;
    }
}
exports.RawContactRejectedEvent = RawContactRejectedEvent;
//# sourceMappingURL=raw-contact-rejected.event.js.map