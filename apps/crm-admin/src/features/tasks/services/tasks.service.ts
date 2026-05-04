import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  TaskListItem,
  TaskDetail,
  TaskListParams,
  TaskCreateData,
  TaskUpdateData,
} from "../types/tasks.types";

const BASE_URL = "/api/v1/tasks";

export const tasksService = {
  getAll: (params?: TaskListParams) =>
    apiClient
      .get<ApiResponse<TaskListItem[]>>(BASE_URL, { params })
      .then((r) => r.data),

  getMy: (params?: TaskListParams) =>
    apiClient
      .get<ApiResponse<TaskListItem[]>>(`${BASE_URL}/my`, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<TaskDetail>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  create: (payload: TaskCreateData) =>
    apiClient
      .post<ApiResponse<TaskDetail>>(BASE_URL, payload)
      .then((r) => r.data),

  update: (id: string, payload: TaskUpdateData) =>
    apiClient
      .put<ApiResponse<TaskDetail>>(`${BASE_URL}/${id}`, payload)
      .then((r) => r.data),

  changeStatus: (id: string, status: string, reason?: string) =>
    apiClient
      .post<ApiResponse<TaskDetail>>(`${BASE_URL}/${id}/status`, { status, reason })
      .then((r) => r.data),

  complete: (id: string, notes?: string, actualMinutes?: number) =>
    apiClient
      .post<ApiResponse<TaskDetail>>(`${BASE_URL}/${id}/complete`, { completionNotes: notes, actualMinutes })
      .then((r) => r.data),

  assign: (id: string, assignedToId: string) =>
    apiClient
      .post<ApiResponse<TaskDetail>>(`${BASE_URL}/${id}/assign`, { assignedToId })
      .then((r) => r.data),

  delete: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`${BASE_URL}/${id}`)
      .then((r) => r.data),

  approve: (id: string) =>
    apiClient
      .post<ApiResponse<TaskDetail>>(`${BASE_URL}/${id}/approve`)
      .then((r) => r.data),

  reject: (id: string, reason?: string) =>
    apiClient
      .post<ApiResponse<TaskDetail>>(`${BASE_URL}/${id}/reject`, { reason })
      .then((r) => r.data),

  getStats: () =>
    apiClient
      .get<ApiResponse<any>>(`${BASE_URL}/stats`)
      .then((r) => r.data),
};
