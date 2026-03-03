import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  WorkflowListItem,
  WorkflowDetail,
  WorkflowListParams,
  WorkflowCreateData,
  WorkflowUpdateData,
  WorkflowState,
  WorkflowStateCreateData,
  WorkflowStateUpdateData,
  WorkflowTransition,
  WorkflowTransitionCreateData,
  WorkflowTransitionUpdateData,
  WorkflowVisualData,
  WorkflowValidationResult,
} from "../types/workflows.types";

const BASE_URL = "/workflows";

export const workflowsService = {
  getAll: (params?: WorkflowListParams) =>
    apiClient
      .get<ApiResponse<WorkflowListItem[]>>(BASE_URL, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<WorkflowDetail>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: WorkflowCreateData) =>
    apiClient
      .post<ApiResponse<WorkflowDetail>>(BASE_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: WorkflowUpdateData) =>
    apiClient
      .put<ApiResponse<WorkflowDetail>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  publish: (id: string) =>
    apiClient
      .post<ApiResponse<WorkflowDetail>>(`${BASE_URL}/${id}/publish`)
      .then((r) => r.data),

  clone: (id: string) =>
    apiClient
      .post<ApiResponse<WorkflowDetail>>(`${BASE_URL}/${id}/clone`)
      .then((r) => r.data),

  getVisual: (id: string) =>
    apiClient
      .get<ApiResponse<WorkflowVisualData>>(`${BASE_URL}/${id}/visual`)
      .then((r) => r.data),

  validate: (id: string) =>
    apiClient
      .post<ApiResponse<WorkflowValidationResult>>(
        `${BASE_URL}/${id}/validate`,
      )
      .then((r) => r.data),
};

export const workflowConfigService = {
  addState: (workflowId: string, payload: WorkflowStateCreateData) =>
    apiClient
      .post<ApiResponse<WorkflowState>>(
        `${BASE_URL}/${workflowId}/states`,
        payload,
      )
      .then((r) => r.data),

  updateState: (stateId: string, payload: WorkflowStateUpdateData) =>
    apiClient
      .put<ApiResponse<WorkflowState>>(`${BASE_URL}/states/${stateId}`, payload)
      .then((r) => r.data),

  deleteState: (stateId: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${BASE_URL}/states/${stateId}`)
      .then((r) => r.data),

  addTransition: (
    workflowId: string,
    payload: WorkflowTransitionCreateData,
  ) =>
    apiClient
      .post<ApiResponse<WorkflowTransition>>(
        `${BASE_URL}/${workflowId}/transitions`,
        payload,
      )
      .then((r) => r.data),

  updateTransition: (
    transitionId: string,
    payload: WorkflowTransitionUpdateData,
  ) =>
    apiClient
      .put<ApiResponse<WorkflowTransition>>(
        `${BASE_URL}/transitions/${transitionId}`,
        payload,
      )
      .then((r) => r.data),

  deleteTransition: (transitionId: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${BASE_URL}/transitions/${transitionId}`)
      .then((r) => r.data),
};
