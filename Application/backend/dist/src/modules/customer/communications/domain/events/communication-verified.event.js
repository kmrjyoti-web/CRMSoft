"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationVerifiedEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class CommunicationVerifiedEvent extends domain_event_1.DomainEvent {
    constructor(communicationId, type, value) {
        super(communicationId, 'CommunicationVerified');
        this.communicationId = communicationId;
        this.type = type;
        this.value = value;
    }
}
exports.CommunicationVerifiedEvent = CommunicationVerifiedEvent;
//# sourceMappingURL=communication-verified.event.js.map