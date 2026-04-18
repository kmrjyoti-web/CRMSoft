import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  MaskingPolicy,
  CreateMaskingPolicyData,
  UpdateMaskingPolicyData,
  UnmaskRequest,
} from "../types/table-config.types";

interface MaskingRule {
  columnId: string;
  maskType: "FULL" | "PARTIAL";
  canUnmask: boolean;
}

const BASE_URL = "/api/v1/data-masking";

export const dataMaskingService = {
  getRules: (tableKey: string) =>
    apiClient
      .get<ApiResponse<MaskingRule[]>>(`${BASE_URL}/${tableKey}`)
      .then((r) => r.data),

  listPolicies: (tableKey?: string) =>
    apiClient
      .get<ApiResponse<MaskingPolicy[]>>(BASE_URL, {
        params: tableKey ? { tableKey } : undefined,
      })
      .then((r) => r.data),

  createPolicy: (data: CreateMaskingPolicyData) =>
    apiClient
      .post<ApiResponse<MaskingPolicy>>(BASE_URL, data)
      .then((r) => r.data),

  updatePolicy: (id: string, data: UpdateMaskingPolicyData) =>
    apiClient
      .put<ApiResponse<MaskingPolicy>>(`${BASE_URL}/${id}`, data)
      .then((r) => r.data),

  deletePolicy: (id: string) =>
    apiClient
      .delete<ApiResponse<{ deleted: boolean }>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  unmask: (data: UnmaskRequest) =>
    apiClient
      .post<ApiResponse<{ value: string | null }>>(`${BASE_URL}/unmask`, data)
      .then((r) => r.data),
};
