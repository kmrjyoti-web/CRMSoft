import { DomainEvent } from '../../../../../shared/domain/domain-event';

export class ContactDeactivatedEvent extends DomainEvent {
  constructor(
    public readonly contactId: string,
    public readonly firstName: string,
    public readonly lastName: string,
  ) {
    super(contactId, 'ContactDeactivated');
  }
}
