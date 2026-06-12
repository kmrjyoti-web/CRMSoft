export type PlanInterval = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
export type LimitType = 'TOTAL' | 'MONTHLY' | 'UNLIMITED' | 'DISABLED';

export interface PlanListItem {
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
  configJson?: Record<string, unknown>;
  limits?: PlanLimitItem[];
}

export interface PlanLimitItem {
  id: string;
  planId: string;
  resourceKey: string;
  limitType: LimitType;
  limitValue: number;
  isChargeable: boolean;
  chargeTokens: number;
}

export interface SubscriptionDetail {
  id: string;
  tenantId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialEndsAt?: string;
  cancelledAt?: string;
  plan: PlanListItem;
}

export interface UsageDetail {
  resourceKey: string;
  currentCount: number;
  monthlyCount: number;
  monthYear?: string;
}

export interface LimitWithUsage {
  resourceKey: string;
  allowed: boolean;
  current: number;
  limit: number;
  limitType: LimitType;
  isChargeable: boolean;
  chargeTokens: number;
}

export interface SubscriptionLimitsResponse {
  planName: string;
  limits: LimitWithUsage[];
}

export interface TenantInvoiceItem {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
  paidAt?: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export interface PlanCreateData {
  name: string;
  code: string;
  interval: PlanInterval;
  price: number;
  maxUsers: number;
  maxContacts: number;
  maxLeads: number;
  maxProducts: number;
  maxStorage: number;
  features: string[];
  description?: string;
  currency?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface PlanUpdateData {
  name?: string;
  description?: string;
  price?: number;
  maxUsers?: number;
  maxContacts?: number;
  maxLeads?: number;
  maxProducts?: number;
  maxStorage?: number;
  features?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpsertPlanLimitData {
  resourceKey: string;
  limitType: LimitType;
  limitValue: number;
  isChargeable?: boolean;
  chargeTokens?: number;
}
