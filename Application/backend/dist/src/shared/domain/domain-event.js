"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvent = void 0;
class DomainEvent {
    constructor(aggregateId, eventName) {
        this.aggregateId = aggregateId;
        this.eventName = eventName;
        this.occurredOn = new Date();
    }
}
exports.DomainEvent = DomainEvent;
//# sourceMappingURL=domain-event.js.map