import { DomainEvent } from '../../../../../shared/domain/domain-event';

export class LeadCreatedEvent extends DomainEvent {
  constructor(
    public readonly leadId: string,
    public readonly contactId: string,
    public readonly createdById: string,
  ) {
    super(leadId, 'LeadCreated');
  }
}

