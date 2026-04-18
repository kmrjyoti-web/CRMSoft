import { DomainEvent } from '../../../../../shared/domain/domain-event';
export declare class LeadCreatedEvent extends DomainEvent {
    readonly leadId: string;
    readonly contactId: string;
    readonly createdById: string;
    constructor(leadId: string, contactId: string, createdById: string);
}
