"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationAddedEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class CommunicationAddedEvent extends domain_event_1.DomainEvent {
    constructor(communicationId, type, value, entityType, entityId) {
        super(communicationId, 'CommunicationAdded');
        this.communicationId = communicationId;
        this.type = type;
        this.value = value;
        this.entityType = entityType;
        this.entityId = entityId;
    }
}
exports.CommunicationAddedEvent = CommunicationAddedEvent;
//# sourceMappingURL=communication-added.event.js.map