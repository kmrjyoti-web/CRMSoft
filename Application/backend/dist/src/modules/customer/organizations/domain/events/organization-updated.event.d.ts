import { DomainEvent } from '../../../../../shared/domain/domain-event';
export declare class OrganizationUpdatedEvent extends DomainEvent {
    readonly organizationId: string;
    readonly name: string;
    constructor(organizationId: string, name: string);
}
