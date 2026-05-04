import { AggregateRoot } from '../../../../../shared/domain/aggregate-root';
import { ContactOrgRelation } from '../../../../../shared/domain/value-objects/contact-org-relation.vo';

export interface CreateContactOrgProps {
  contactId: string;
  organizationId: string;
  relationType?: string;
  isPrimary?: boolean;
  designation?: string;
  department?: string;
  startDate?: Date;
  notes?: string;
}

/**
