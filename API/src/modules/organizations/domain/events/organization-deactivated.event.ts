import { DomainEvent } from '../../../../shared/domain/domain-event';

export class OrganizationDeactivatedEvent extends DomainEvent {
  constructor(
    public readonly organizationId: string,
    public readonly name: string,
  ) {
    super(organizationId, 'OrganizationDeactivated');
  }
}
