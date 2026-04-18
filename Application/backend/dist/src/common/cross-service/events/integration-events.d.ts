import { IEvent } from '@nestjs/cqrs';
export interface IntegrationEventPayload {
    tenantId: string;
    [key: string]: unknown;
}
export declare abstract class IntegrationEvent implements IEvent {
    readonly eventId: string;
    readonly occurredAt: Date;
    abstract readonly eventName: string;
    abstract readonly sourceService: 'vendor' | 'identity' | 'work';
    abstract readonly payload: IntegrationEventPayload;
    constructor();
}
export declare class LeadConvertedEvent extends IntegrationEvent {
    readonly payload: IntegrationEventPayload & {
        leadId: string;
        contactId: string;
        organizationId?: string;
    };
    readonly eventName = "lead.converted";
    readonly sourceService: "work";
    constructor(payload: IntegrationEventPayload & {
        leadId: string;
        contactId: string;
        organizationId?: string;
    });
}
export declare class OrderCreatedEvent extends IntegrationEvent {
    readonly payload: IntegrationEventPayload & {
        orderId: string;
        totalAmount: number;
        currency: string;
    };
    readonly eventName = "order.created";
    readonly sourceService: "work";
    constructor(payload: IntegrationEventPayload & {
        orderId: string;
        totalAmount: number;
        currency: string;
    });
}
export declare class PaymentConfirmedEvent extends IntegrationEvent {
    readonly payload: IntegrationEventPayload & {
        paymentId: string;
        invoiceId: string;
        amount: number;
    };
    readonly eventName = "payment.confirmed";
    readonly sourceService: "work";
    constructor(payload: IntegrationEventPayload & {
        paymentId: string;
        invoiceId: string;
        amount: number;
    });
}
export declare class TenantActivatedEvent extends IntegrationEvent {
    readonly payload: IntegrationEventPayload & {
        packageId: string;
        hasDedicatedDb: boolean;
        industryCode: string;
    };
    readonly eventName = "tenant.activated";
    readonly sourceService: "identity";
    constructor(payload: IntegrationEventPayload & {
        packageId: string;
        hasDedicatedDb: boolean;
        industryCode: string;
    });
}
export declare class UserDeactivatedEvent extends IntegrationEvent {
    readonly payload: IntegrationEventPayload & {
        userId: string;
        reason: 'suspended' | 'deleted';
    };
    readonly eventName = "user.deactivated";
    readonly sourceService: "identity";
    constructor(payload: IntegrationEventPayload & {
        userId: string;
        reason: 'suspended' | 'deleted';
    });
}
export declare class PackageUpdatedEvent extends IntegrationEvent {
    readonly payload: IntegrationEventPayload & {
        packageId: string;
        previousPackageId: string;
        changes: string[];
    };
    readonly eventName = "package.updated";
    readonly sourceService: "vendor";
    constructor(payload: IntegrationEventPayload & {
        packageId: string;
        previousPackageId: string;
        changes: string[];
    });
}
export declare class LookupUpdatedEvent extends IntegrationEvent {
    readonly payload: IntegrationEventPayload & {
        category: string;
        changedCodes: string[];
    };
    readonly eventName = "lookup.updated";
    readonly sourceService: "vendor";
    constructor(payload: IntegrationEventPayload & {
        category: string;
        changedCodes: string[];
    });
}
