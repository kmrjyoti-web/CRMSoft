import { DomainEvent } from '../../../../../shared/domain/domain-event';
export declare class ContactUpdatedEvent extends DomainEvent {
    readonly contactId: string;
    readonly changedFields: string[];
    readonly updatedById: string;
    constructor(contactId: string, changedFields: string[], updatedById: string);
}
