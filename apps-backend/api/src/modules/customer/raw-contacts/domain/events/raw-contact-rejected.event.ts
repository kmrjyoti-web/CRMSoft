import { DomainEvent } from '../../../../../shared/domain/domain-event';

export class RawContactRejectedEvent extends DomainEvent {
  constructor(
    public readonly rawContactId: string,
    public readonly reason: string | undefined,
  ) {
    super(rawContactId, 'RawContactRejected');
  }
}
