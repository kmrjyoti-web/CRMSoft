import { DomainEvent } from '../../../../../shared/domain/domain-event';
export declare class LeadAllocatedEvent extends DomainEvent {
    readonly leadId: string;
    readonly allocatedToId: string;
    readonly contactId: string;
    constructor(leadId: string, allocatedToId: string, contactId: string);
}
