import { DomainEvent } from '../../../../../shared/domain/domain-event';

export class OrganizationCreatedEvent extends DomainEvent {
  constructor(
    public readonly organizationId: string,
    public readonly name: string,
    public readonly industry: string | undefined,
    public readonly createdById: string,
  ) {
    super(organizationId, 'OrganizationCreated');
  }
}
