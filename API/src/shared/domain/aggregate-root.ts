import { AggregateRoot as NestAggregateRoot } from '@nestjs/cqrs';
import { DomainEvent } from './domain-event';

/**
 * Aggregate Root - Entry point to a cluster of domain objects.
 * Collects domain events during business operations.
 * Events are published after persistence (in handler).
 */
export abstract class AggregateRoot extends NestAggregateRoot {
  protected _id: string;
  protected _createdAt: Date;
  protected _updatedAt: Date;
  private _domainEvents: DomainEvent[] = [];

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
    // Also apply to @nestjs/cqrs event bus
    this.apply(event);
  }

  getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  equals(other: AggregateRoot): boolean {
    if (!other) return false;
    return this._id === other._id;
  }
}

