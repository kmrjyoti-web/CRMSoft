import { DomainEvent } from '../../../../../shared/domain/domain-event';
export declare class OrganizationCreatedEvent extends DomainEvent {
    readonly organizationId: string;
    readonly name: string;
    readonly industry: string | undefined;
    readonly createdById: string;
    constructor(organizationId: string, name: string, industry: string | undefined, createdById: string);
}
