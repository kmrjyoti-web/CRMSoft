import { DomainEvent } from '../../../../../shared/domain/domain-event';
export declare class RawContactRejectedEvent extends DomainEvent {
    readonly rawContactId: string;
    readonly reason: string | undefined;
    constructor(rawContactId: string, reason: string | undefined);
}
