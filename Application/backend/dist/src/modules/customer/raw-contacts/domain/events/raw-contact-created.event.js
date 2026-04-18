"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawContactCreatedEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class RawContactCreatedEvent extends domain_event_1.DomainEvent {
    constructor(rawContactId, firstName, lastName, source, createdById) {
        super(rawContactId, 'RawContactCreated');
        this.rawContactId = rawContactId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.source = source;
        this.createdById = createdById;
    }
}
exports.RawContactCreatedEvent = RawContactCreatedEvent;
//# sourceMappingURL=raw-contact-created.event.js.map