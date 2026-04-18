"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvent = void 0;
class DomainEvent {
    constructor(eventName, tenantId, userId) {
        this.occurredOn = new Date();
        this.eventName = eventName;
        this.tenantId = tenantId;
        this.userId = userId;
    }
}
exports.DomainEvent = DomainEvent;
//# sourceMappingURL=domain-event.js.map