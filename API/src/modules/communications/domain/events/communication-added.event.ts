import { DomainEvent } from '../../../../shared/domain/domain-event';

export class CommunicationAddedEvent extends DomainEvent {
  constructor(
    public readonly communicationId: string,
    public readonly type: string,
    public readonly value: string,
    public readonly entityType: string,
    public readonly entityId: string,
  ) {
    super(communicationId, 'CommunicationAdded');
  }
}
