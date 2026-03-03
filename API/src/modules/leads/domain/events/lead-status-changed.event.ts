import { DomainEvent } from '../../../../shared/domain/domain-event';

export class LeadStatusChangedEvent extends DomainEvent {
  constructor(
    public readonly leadId: string,
    public readonly fromStatus: string,
    public readonly toStatus: string,
  ) {
    super(leadId, 'LeadStatusChanged');
  }
}

