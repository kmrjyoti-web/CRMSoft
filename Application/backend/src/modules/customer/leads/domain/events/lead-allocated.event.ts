import { DomainEvent } from '../../../../../shared/domain/domain-event';

export class LeadAllocatedEvent extends DomainEvent {
  constructor(
    public readonly leadId: string,
    public readonly allocatedToId: string,
    public readonly contactId: string,
  ) {
    super(leadId, 'LeadAllocated');
  }
}

