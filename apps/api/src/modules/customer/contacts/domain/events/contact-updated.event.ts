import { DomainEvent } from '../../../../../shared/domain/domain-event';

export class ContactUpdatedEvent extends DomainEvent {
  constructor(
    public readonly contactId: string,
    public readonly changedFields: string[],
    public readonly updatedById: string,
  ) {
    super(contactId, 'ContactUpdated');
  }
}
