import { api } from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';
import type {
  PlanListItem,
  PlanCreateData,
  PlanUpdateData,
  PlanLimitItem,
  UpsertPlanLimitData,
} from '../types/subscription.types';

const BASE_URL = '/api/v1/admin/plans';

export const planAdminService = {
  getAll: (isActive?: boolean) =>
    api.get<ApiResponse<PlanListItem[]>>(BASE_URL, { params: { isActive } }).then((r) => (r.data?.data ?? []) as PlanListItem[]),

  getById: (id: string) =>
    api.get<ApiResponse<PlanListItem>>(`${BASE_URL}/${id}`).then((r) => r.data?.data as PlanListItem),

  create: (data: PlanCreateData) =>
    api.post<ApiResponse<PlanListItem>>(BASE_URL, data).then((r) => r.data?.data as PlanListItem),

  update: (id: string, data: PlanUpdateData) =>
    api.put<ApiResponse<PlanListItem>>(`${BASE_URL}/${id}`, data).then((r) => r.data?.data as PlanListItem),

  deactivate: (id: string) =>
    api.post<ApiResponse<PlanListItem>>(`${BASE_URL}/${id}/deactivate`).then((r) => r.data?.data as PlanListItem),

  // Plan Limits
  getLimits: (planId: string) =>
    api.get<ApiResponse<PlanLimitItem[]>>(`${BASE_URL}/${planId}/limits`).then((r) => (r.data?.data ?? []) as PlanLimitItem[]),

  upsertLimits: (planId: string, limits: UpsertPlanLimitData[]) =>
    api.put<ApiResponse<PlanLimitItem[]>>(`${BASE_URL}/${planId}/limits`, { limits }).then((r) => (r.data?.data ?? []) as PlanLimitItem[]),

  deleteLimit: (planId: string, limitId: string) =>
    api.delete<ApiResponse<void>>(`${BASE_URL}/${planId}/limits/${limitId}`).then((r) => r.data),
};
