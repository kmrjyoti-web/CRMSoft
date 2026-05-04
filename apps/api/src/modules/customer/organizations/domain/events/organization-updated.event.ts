import { DomainEvent } from '../../../../../shared/domain/domain-event';

export class OrganizationUpdatedEvent extends DomainEvent {
  constructor(
    public readonly organizationId: string,
    public readonly name: string,
  ) {
    super(organizationId, 'OrganizationUpdated');
  }
}
