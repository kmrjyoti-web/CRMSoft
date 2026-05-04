import { DomainEvent } from '../../../../../shared/domain/domain-event';

export class ContactCreatedEvent extends DomainEvent {
  constructor(
    public readonly contactId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly createdById: string,
  ) {
    super(contactId, 'ContactCreated');
  }
}
