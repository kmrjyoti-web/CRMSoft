import { DomainEvent } from '../../../../shared/domain/domain-event';

export class ContactUnlinkedFromOrgEvent extends DomainEvent {
  constructor(
    public readonly mappingId: string,
    public readonly contactId: string,
    public readonly organizationId: string,
  ) {
    super(mappingId, 'ContactUnlinkedFromOrg');
  }
}
