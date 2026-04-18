import { DomainEvent } from '../../../../../shared/domain/domain-event';
export declare class CommunicationAddedEvent extends DomainEvent {
    readonly communicationId: string;
    readonly type: string;
    readonly value: string;
    readonly entityType: string;
    readonly entityId: string;
    constructor(communicationId: string, type: string, value: string, entityType: string, entityId: string);
}
