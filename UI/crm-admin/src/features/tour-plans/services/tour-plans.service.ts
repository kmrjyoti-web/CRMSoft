import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  TourPlanListItem,
  TourPlanDetail,
  TourPlanListParams,
  TourPlanCreateData,
  TourPlanUpdateData,
  TourPlanRejectData,
  VisitCheckInData,
  VisitCheckOutData,
} from "../types/tour-plans.types";

const BASE_URL = "/tour-plans";

export const tourPlansService = {
  getAll: (params?: TourPlanListParams) =>
    apiClient
      .get<ApiResponse<TourPlanListItem[]>>(BASE_URL, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<TourPlanDetail>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: TourPlanCreateData) =>
    apiClient
      .post<ApiResponse<TourPlanDetail>>(BASE_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: TourPlanUpdateData) =>
    apiClient
      .put<ApiResponse<TourPlanDetail>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  submit: (id: string) =>
    apiClient
      .post<ApiResponse<TourPlanDetail>>(`${BASE_URL}/${id}/submit`)
      .then((r) => r.data),

  approve: (id: string) =>
    apiClient
      .post<ApiResponse<TourPlanDetail>>(`${BASE_URL}/${id}/approve`)
      .then((r) => r.data),

  reject: (id: string, payload: TourPlanRejectData) =>
    apiClient
      .post<ApiResponse<TourPlanDetail>>(`${BASE_URL}/${id}/reject`, payload)
      .then((r) => r.data),

  cancel: (id: string) =>
    apiClient
      .post<ApiResponse<TourPlanDetail>>(`${BASE_URL}/${id}/cancel`)
      .then((r) => r.data),

  visitCheckIn: (visitId: string, payload: VisitCheckInData) =>
    apiClient
      .post<ApiResponse<TourPlanDetail>>(
        `${BASE_URL}/visits/${visitId}/check-in`,
        payload,
      )
      .then((r) => r.data),

  visitCheckOut: (visitId: string, payload: VisitCheckOutData) =>
    apiClient
      .post<ApiResponse<TourPlanDetail>>(
        `${BASE_URL}/visits/${visitId}/check-out`,
        payload,
      )
      .then((r) => r.data),
};
