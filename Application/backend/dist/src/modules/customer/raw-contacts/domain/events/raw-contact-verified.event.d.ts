import { DomainEvent } from '../../../../../shared/domain/domain-event';
export declare class RawContactVerifiedEvent extends DomainEvent {
    readonly rawContactId: string;
    readonly contactId: string;
    readonly verifiedById: string;
    readonly companyName: string | undefined;
    constructor(rawContactId: string, contactId: string, verifiedById: string, companyName: string | undefined);
}
