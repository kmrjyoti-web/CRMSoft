export declare abstract class DomainEvent {
    readonly occurredOn: Date;
    readonly eventName: string;
    readonly tenantId: string;
    readonly userId: string;
    protected constructor(eventName: string, tenantId: string, userId: string);
}
