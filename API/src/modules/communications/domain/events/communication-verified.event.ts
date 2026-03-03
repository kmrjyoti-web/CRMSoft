import { DomainEvent } from '../../../../shared/domain/domain-event';

export class CommunicationVerifiedEvent extends DomainEvent {
  constructor(
    public readonly communicationId: string,
    public readonly type: string,
    public readonly value: string,
  ) {
    super(communicationId, 'CommunicationVerified');
  }
}
