import { DomainEvent } from '../../../../../shared/domain/domain-event';

export class RawContactDuplicateEvent extends DomainEvent {
  constructor(
    public readonly rawContactId: string,
    public readonly duplicateOfId: string | undefined,
  ) {
    super(rawContactId, 'RawContactDuplicate');
  }
}
