import { DomainEvent } from '../../../../../shared/domain/domain-event';
export declare class RawContactCreatedEvent extends DomainEvent {
    readonly rawContactId: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly source: string;
    readonly createdById: string;
    constructor(rawContactId: string, firstName: string, lastName: string, source: string, createdById: string);
}
