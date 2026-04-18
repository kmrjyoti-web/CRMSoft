export declare abstract class DomainEvent {
    readonly aggregateId: string;
    readonly eventName: string;
    readonly occurredOn: Date;
    constructor(aggregateId: string, eventName: string);
}
