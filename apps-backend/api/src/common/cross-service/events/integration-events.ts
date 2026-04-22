/**
 * Integration Events
 *
 * Events that cross service boundaries. Today they are published in-process
 * via NestJS CQRS EventBus. When services are extracted, they will be published
 * to a message broker (RabbitMQ / Redis Streams).
 *
 * Naming convention: <aggregate>.<verb> — past tense, dot-separated.
 * All integration events carry a unique eventId and sourceService.
 *
 * Usage:
 *   import { EventBus } from '@nestjs/cqrs';
 *   this.eventBus.publish(new LeadConvertedEvent({ ... }));
 *
 * At extraction time:
 *   Replace EventBus.publish() with message broker publish.
 *   Replace @EventHandler() with message broker consumer.
 */

import { IEvent } from '@nestjs/cqrs';

// ─── Base ─────────────────────────────────────────────────────────────────────

export interface IntegrationEventPayload {
  tenantId: string;
  [key: string]: unknown;
}

export abstract class IntegrationEvent implements IEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  abstract readonly eventName: string;
  abstract readonly sourceService: 'vendor' | 'identity' | 'work';
  abstract readonly payload: IntegrationEventPayload;

  constructor() {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }
}

// ─── Work → others ────────────────────────────────────────────────────────────

/**
 * Published when a Lead is converted to a Contact + Deal.
 * Vendor may listen to trigger onboarding sequences.
 */
export class LeadConvertedEvent extends IntegrationEvent {
  readonly eventName = 'lead.converted';
  readonly sourceService = 'work' as const;

  constructor(
    public readonly payload: IntegrationEventPayload & {
      leadId: string;
      contactId: string;
      organizationId?: string;
    },
  ) {
    super();
  }
}

/**
 * Published when a Sales Order is created.
 * Identity (billing) and Vendor (analytics) may listen.
 */
export class OrderCreatedEvent extends IntegrationEvent {
  readonly eventName = 'order.created';
  readonly sourceService = 'work' as const;

  constructor(
    public readonly payload: IntegrationEventPayload & {
      orderId: string;
      totalAmount: number;
      currency: string;
    },
  ) {
    super();
  }
}

/**
 * Published when a Payment is confirmed.
 * Identity (billing reconciliation) may listen.
 */
export class PaymentConfirmedEvent extends IntegrationEvent {
  readonly eventName = 'payment.confirmed';
  readonly sourceService = 'work' as const;

  constructor(
    public readonly payload: IntegrationEventPayload & {
      paymentId: string;
      invoiceId: string;
      amount: number;
    },
  ) {
    super();
  }
}

// ─── Identity → others ────────────────────────────────────────────────────────

/**
 * Published when a new Tenant is provisioned and activated.
 * Vendor listens to assign a package and seed lookup data.
 * Work listens to create initial CRM records.
 */
export class TenantActivatedEvent extends IntegrationEvent {
  readonly eventName = 'tenant.activated';
  readonly sourceService = 'identity' as const;

  constructor(
    public readonly payload: IntegrationEventPayload & {
      packageId: string;
      hasDedicatedDb: boolean;
      industryCode: string;
    },
  ) {
    super();
  }
}

/**
 * Published when a User is deactivated (suspended/deleted).
 * Work listens to reassign or close open activities/leads.
 * Vendor listens to revoke credentials and integrations.
 */
export class UserDeactivatedEvent extends IntegrationEvent {
  readonly eventName = 'user.deactivated';
  readonly sourceService = 'identity' as const;

  constructor(
    public readonly payload: IntegrationEventPayload & {
      userId: string;
      reason: 'suspended' | 'deleted';
    },
  ) {
    super();
  }
}

// ─── Vendor → others ──────────────────────────────────────────────────────────

/**
 * Published when a Tenant's Package is updated (upgraded/downgraded).
 * Identity listens to update the billing record.
 * Work listens to enable/disable module-gated features.
 */
export class PackageUpdatedEvent extends IntegrationEvent {
  readonly eventName = 'package.updated';
  readonly sourceService = 'vendor' as const;

  constructor(
    public readonly payload: IntegrationEventPayload & {
      packageId: string;
      previousPackageId: string;
      changes: string[];
    },
  ) {
    super();
  }
}

/**
 * Published when a Lookup category's values are modified by the admin.
 * Work listens to invalidate dropdown caches.
 */
export class LookupUpdatedEvent extends IntegrationEvent {
  readonly eventName = 'lookup.updated';
  readonly sourceService = 'vendor' as const;

  constructor(
    public readonly payload: IntegrationEventPayload & {
      category: string;
      changedCodes: string[];
    },
  ) {
    super();
  }
}
