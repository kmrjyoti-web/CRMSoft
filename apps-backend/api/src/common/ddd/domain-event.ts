/**
 * DomainEvent — base for all domain events published after mutations.
 *
 * Rules:
 *  - Published AFTER successful persistence.
 *  - Event handlers are fire-and-forget (non-blocking).
 *  - Cross-module communication happens via events, not direct service calls.
 *  - Naming: [Entity]CreatedEvent, [Entity]UpdatedEvent, [Entity]DeletedEvent
 */
export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string;
  public readonly tenantId: string;
  public readonly userId: string;

  protected constructor(eventName: string, tenantId: string, userId: string) {
    this.occurredOn = new Date();
    this.eventName = eventName;
    this.tenantId = tenantId;
    this.userId = userId;
  }
}
