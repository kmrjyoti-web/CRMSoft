import { DomainEvent } from '../../../../../shared/domain/domain-event';
export declare class RawContactDuplicateEvent extends DomainEvent {
    readonly rawContactId: string;
    readonly duplicateOfId: string | undefined;
    constructor(rawContactId: string, duplicateOfId: string | undefined);
}
