import { DomainEvent } from '../../../../../shared/domain/domain-event';
export declare class ContactCreatedEvent extends DomainEvent {
    readonly contactId: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly createdById: string;
    constructor(contactId: string, firstName: string, lastName: string, createdById: string);
}
