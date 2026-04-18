import { DomainEvent } from '../../../../../shared/domain/domain-event';
export declare class LeadStatusChangedEvent extends DomainEvent {
    readonly leadId: string;
    readonly fromStatus: string;
    readonly toStatus: string;
    constructor(leadId: string, fromStatus: string, toStatus: string);
}
