export type PlanInterval = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface Plan {
  id: string;
  name: string;
  code: string;
  description?: string;
  interval: PlanInterval;
  price: number;
  currency: string;
  maxUsers: number;
  maxContacts: number;
  maxLeads: number;
  maxProducts: number;
  maxStorage: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  industryCode?: string | null;
}

export interface PlanCreateData {
  name: string;
  code: string;
  interval: PlanInterval;
  price: number;
  maxUsers: number;
  maxContacts?: number;
  maxLeads?: number;
  maxProducts?: number;
  maxStorage?: number;
  features?: string[];
  description?: string;
  industryCode?: string;
}

export interface PlanFilters {
  search?: string;
  isActive?: boolean;
  industryCode?: string;
  page?: number;
  limit?: number;
}
