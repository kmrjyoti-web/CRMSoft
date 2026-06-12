export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  byDay?: string[];       // ['MO', 'WE', 'FR']
  byMonthDay?: number[];  // [1, 15]
  byMonth?: number[];     // [1, 6, 12]
  until?: string;
  count?: number;
}

export interface RecurrencePattern {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  rule: RecurrenceRule;
  startDate: string;
  endDate?: string;
  nextOccurrence?: string;
  lastOccurrence?: string;
  occurrenceCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurrenceDto {
  entityType: string;
  entityId: string;
  rule: RecurrenceRule;
  startDate: string;
  endDate?: string;
}

export interface RecurrenceFilters {
  page?: number;
  limit?: number;
  entityType?: string;
  isActive?: boolean;
}
