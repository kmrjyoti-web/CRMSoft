import { AggregateRoot } from '../../../../../shared/domain/aggregate-root';
import { ContactCreatedEvent } from '../events/contact-created.event';
import { ContactUpdatedEvent } from '../events/contact-updated.event';
import { ContactDeactivatedEvent } from '../events/contact-deactivated.event';

export interface CreateContactProps {
  firstName: string;
  lastName: string;
  designation?: string;
  department?: string;
  notes?: string;
  createdById: string;
}

export interface UpdateContactProps {
  firstName?: string;
  lastName?: string;
  designation?: string;
  department?: string;
  notes?: string;
}

/**
