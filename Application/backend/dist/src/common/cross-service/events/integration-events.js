"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookupUpdatedEvent = exports.PackageUpdatedEvent = exports.UserDeactivatedEvent = exports.TenantActivatedEvent = exports.PaymentConfirmedEvent = exports.OrderCreatedEvent = exports.LeadConvertedEvent = exports.IntegrationEvent = void 0;
class IntegrationEvent {
    constructor() {
        this.eventId = crypto.randomUUID();
        this.occurredAt = new Date();
    }
}
exports.IntegrationEvent = IntegrationEvent;
class LeadConvertedEvent extends IntegrationEvent {
    constructor(payload) {
        super();
        this.payload = payload;
        this.eventName = 'lead.converted';
        this.sourceService = 'work';
    }
}
exports.LeadConvertedEvent = LeadConvertedEvent;
class OrderCreatedEvent extends IntegrationEvent {
    constructor(payload) {
        super();
        this.payload = payload;
        this.eventName = 'order.created';
        this.sourceService = 'work';
    }
}
exports.OrderCreatedEvent = OrderCreatedEvent;
class PaymentConfirmedEvent extends IntegrationEvent {
    constructor(payload) {
        super();
        this.payload = payload;
        this.eventName = 'payment.confirmed';
        this.sourceService = 'work';
    }
}
exports.PaymentConfirmedEvent = PaymentConfirmedEvent;
class TenantActivatedEvent extends IntegrationEvent {
    constructor(payload) {
        super();
        this.payload = payload;
        this.eventName = 'tenant.activated';
        this.sourceService = 'identity';
    }
}
exports.TenantActivatedEvent = TenantActivatedEvent;
class UserDeactivatedEvent extends IntegrationEvent {
    constructor(payload) {
        super();
        this.payload = payload;
        this.eventName = 'user.deactivated';
        this.sourceService = 'identity';
    }
}
exports.UserDeactivatedEvent = UserDeactivatedEvent;
class PackageUpdatedEvent extends IntegrationEvent {
    constructor(payload) {
        super();
        this.payload = payload;
        this.eventName = 'package.updated';
        this.sourceService = 'vendor';
    }
}
exports.PackageUpdatedEvent = PackageUpdatedEvent;
class LookupUpdatedEvent extends IntegrationEvent {
    constructor(payload) {
        super();
        this.payload = payload;
        this.eventName = 'lookup.updated';
        this.sourceService = 'vendor';
    }
}
exports.LookupUpdatedEvent = LookupUpdatedEvent;
//# sourceMappingURL=integration-events.js.map