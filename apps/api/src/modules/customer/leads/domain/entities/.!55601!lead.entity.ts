import { AggregateRoot } from '../../../../../shared/domain/aggregate-root';
import { LeadStatus } from '../value-objects/lead-status.vo';
import { LeadCreatedEvent } from '../events/lead-created.event';
import { LeadAllocatedEvent } from '../events/lead-allocated.event';
import { LeadStatusChangedEvent } from '../events/lead-status-changed.event';

export interface CreateLeadProps {
  leadNumber: string;
  contactId: string;
  organizationId?: string;
  priority: string;
  expectedValue?: number;
  expectedCloseDate?: Date;
  notes?: string;
  createdById: string;
}

/**
 * Lead Aggregate Root.
 * Contains ALL business rules for lead lifecycle.
