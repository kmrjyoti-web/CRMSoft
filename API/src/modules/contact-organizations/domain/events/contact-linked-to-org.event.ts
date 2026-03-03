import { DomainEvent } from '../../../../shared/domain/domain-event';

export class ContactLinkedToOrgEvent extends DomainEvent {
  constructor(
    public readonly mappingId: string,
    public readonly contactId: string,
    public readonly organizationId: string,
    public readonly relationType: string,
  ) {
    super(mappingId, 'ContactLinkedToOrg');
  }
}
