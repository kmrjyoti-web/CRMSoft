"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawContactDuplicateEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class RawContactDuplicateEvent extends domain_event_1.DomainEvent {
    constructor(rawContactId, duplicateOfId) {
        super(rawContactId, 'RawContactDuplicate');
        this.rawContactId = rawContactId;
        this.duplicateOfId = duplicateOfId;
    }
}
exports.RawContactDuplicateEvent = RawContactDuplicateEvent;
//# sourceMappingURL=raw-contact-duplicate.event.js.map