import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  DemoListItem,
  DemoDetail,
  DemoListParams,
  DemoCreateData,
  DemoUpdateData,
  DemoRescheduleData,
  DemoCompleteData,
  DemoCancelData,
} from "../types/demos.types";

const BASE_URL = "/demos";

export const demosService = {
  getAll: (params?: DemoListParams) =>
    apiClient
      .get<ApiResponse<DemoListItem[]>>(BASE_URL, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<DemoDetail>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: DemoCreateData) =>
    apiClient
      .post<ApiResponse<DemoDetail>>(BASE_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: DemoUpdateData) =>
    apiClient
      .put<ApiResponse<DemoDetail>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  reschedule: (id: string, payload: DemoRescheduleData) =>
    apiClient
      .post<ApiResponse<DemoDetail>>(`${BASE_URL}/${id}/reschedule`, payload)
      .then((r) => r.data),

  complete: (id: string, payload: DemoCompleteData) =>
    apiClient
      .post<ApiResponse<DemoDetail>>(`${BASE_URL}/${id}/complete`, payload)
      .then((r) => r.data),

  cancel: (id: string, payload: DemoCancelData) =>
    apiClient
      .post<ApiResponse<DemoDetail>>(`${BASE_URL}/${id}/cancel`, payload)
      .then((r) => r.data),

  getByLead: (leadId: string) =>
    apiClient
      .get<ApiResponse<DemoListItem[]>>(`${BASE_URL}/lead/${leadId}`)
      .then((r) => r.data),
};
