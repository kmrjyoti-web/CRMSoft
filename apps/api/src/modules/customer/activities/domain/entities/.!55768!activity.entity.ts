import { AggregateRoot } from '../../../../../shared/domain/aggregate-root';

export interface CreateActivityProps {
  type: string;
  subject: string;
  description?: string;
  scheduledAt?: Date;
  endTime?: Date;
  duration?: number;
  leadId?: string;
  contactId?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  createdById: string;
}

/**
 * Activity Aggregate Root.
 * Contains business rules for activity lifecycle.
