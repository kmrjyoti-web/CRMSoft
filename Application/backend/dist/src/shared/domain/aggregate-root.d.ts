import { AggregateRoot as NestAggregateRoot } from '@nestjs/cqrs';
import { DomainEvent } from './domain-event';
export declare abstract class AggregateRoot extends NestAggregateRoot {
    protected _id: string;
    protected _createdAt: Date;
    protected _updatedAt: Date;
    private _domainEvents;
    get id(): string;
    get createdAt(): Date;
    get updatedAt(): Date;
    protected addDomainEvent(event: DomainEvent): void;
    getDomainEvents(): DomainEvent[];
    clearDomainEvents(): void;
    equals(other: AggregateRoot): boolean;
}
