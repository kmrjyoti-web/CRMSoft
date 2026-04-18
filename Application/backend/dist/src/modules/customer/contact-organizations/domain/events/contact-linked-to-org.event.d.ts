import { DomainEvent } from '../../../../../shared/domain/domain-event';
export declare class ContactLinkedToOrgEvent extends DomainEvent {
    readonly mappingId: string;
    readonly contactId: string;
    readonly organizationId: string;
    readonly relationType: string;
    constructor(mappingId: string, contactId: string, organizationId: string, relationType: string);
}
