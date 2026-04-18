import { DomainEvent } from '../../../../../shared/domain/domain-event';
export declare class ContactDeactivatedEvent extends DomainEvent {
    readonly contactId: string;
    readonly firstName: string;
    readonly lastName: string;
    constructor(contactId: string, firstName: string, lastName: string);
}
