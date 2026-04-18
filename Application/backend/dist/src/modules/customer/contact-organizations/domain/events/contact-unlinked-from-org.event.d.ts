import { DomainEvent } from '../../../../../shared/domain/domain-event';
export declare class ContactUnlinkedFromOrgEvent extends DomainEvent {
    readonly mappingId: string;
    readonly contactId: string;
    readonly organizationId: string;
    constructor(mappingId: string, contactId: string, organizationId: string);
}
