import { AggregateRoot } from '../../../../../shared/domain/aggregate-root';
import { CommunicationType } from '../../../../../shared/domain/value-objects/communication-type.vo';
import { PriorityType } from '../../../../../shared/domain/value-objects/priority-type.vo';
import { Email } from '../../../../../shared/domain/value-objects/email.vo';
import { Phone } from '../../../../../shared/domain/value-objects/phone.vo';

export interface CreateCommunicationProps {
  type: string;
  value: string;
  priorityType?: string;
  isPrimary?: boolean;
  label?: string;
  rawContactId?: string;
  contactId?: string;
  organizationId?: string;
  leadId?: string;
  notes?: string;
}

/**
 * Communication Aggregate Root.
 *
 * Rules:
 * 1. type=EMAIL ? value must be valid email format
 * 2. type=PHONE/MOBILE ? value must be valid phone format
 * 3. At least one entity link is required (rawContactId, contactId, etc.)
