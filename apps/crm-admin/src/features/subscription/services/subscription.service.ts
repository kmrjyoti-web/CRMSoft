import { api } from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';
import type {
  SubscriptionDetail,
  SubscriptionLimitsResponse,
  UsageDetail,
  PlanListItem,
  TenantInvoiceItem,
} from '../types/subscription.types';

const BASE_URL = '/api/v1/tenant/subscription';

export const subscriptionService = {
  getCurrent: () =>
    api.get<ApiResponse<SubscriptionDetail>>(BASE_URL).then((r) => r.data),

  getLimitsWithUsage: () =>
    api.get<ApiResponse<SubscriptionLimitsResponse>>(`${BASE_URL}/limits`).then((r) => r.data),

  getUsageDetail: () =>
    api.get<ApiResponse<UsageDetail[]>>(`${BASE_URL}/usage-detail`).then((r) => r.data),

  getUsage: () =>
    api.get<ApiResponse<Record<string, number>>>(`${BASE_URL}/usage`).then((r) => r.data),

  getPlans: () =>
    api.get<ApiResponse<PlanListItem[]>>(`${BASE_URL}/plans`).then((r) => r.data),

  subscribe: (planId: string) =>
    api.post<ApiResponse<SubscriptionDetail>>(`${BASE_URL}/subscribe`, { planId }).then((r) => r.data),

  changePlan: (newPlanId: string) =>
    api.post<ApiResponse<SubscriptionDetail>>(`${BASE_URL}/change-plan`, { newPlanId }).then((r) => r.data),

  cancel: () =>
    api.post<ApiResponse<SubscriptionDetail>>(`${BASE_URL}/cancel`).then((r) => r.data),

  getInvoices: () =>
    api.get<ApiResponse<TenantInvoiceItem[]>>('/api/v1/tenant/billing/invoices').then((r) => r.data),
};
