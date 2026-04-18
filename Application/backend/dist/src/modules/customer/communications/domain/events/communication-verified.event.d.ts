import { DomainEvent } from '../../../../../shared/domain/domain-event';
export declare class CommunicationVerifiedEvent extends DomainEvent {
    readonly communicationId: string;
    readonly type: string;
    readonly value: string;
    constructor(communicationId: string, type: string, value: string);
}
