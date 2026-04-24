/**
 * Base Domain Event.
 * All domain events carry the aggregate ID, event name, and timestamp.
 * Domain events are past-tense: "LeadCreated", "ContactValidated".
 */
export abstract class DomainEvent {
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly eventName: string,
  ) {
    this.occurredOn = new Date();
  }
}

