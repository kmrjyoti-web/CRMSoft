import { DomainEvent } from '../../../../shared/domain/domain-event';

export class RawContactCreatedEvent extends DomainEvent {
  constructor(
    public readonly rawContactId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly source: string,
    public readonly createdById: string,
  ) {
    super(rawContactId, 'RawContactCreated');
  }
}
