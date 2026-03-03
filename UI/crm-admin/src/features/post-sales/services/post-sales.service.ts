import apiClient from "@/services/api-client";

import type {
  InstallationListItem,
  InstallationDetail,
  InstallationCreateData,
  InstallationUpdateData,
  InstallationListParams,
  TrainingListItem,
  TrainingDetail,
  TrainingCreateData,
  TrainingUpdateData,
  TrainingListParams,
  TicketListItem,
  TicketDetail,
  TicketCreateData,
  TicketUpdateData,
  TicketListParams,
  AssignTicketData,
  ResolveTicketData,
  AddCommentData,
  TicketComment,
} from "../types/post-sales.types";

import type { ApiResponse } from "@/types/api-response";

// ---------------------------------------------------------------------------
// Installation Service
// ---------------------------------------------------------------------------

export const installationService = {
  getAll(params?: InstallationListParams) {
    return apiClient.get<ApiResponse<InstallationListItem[]>>("/installations", { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<InstallationDetail>>(`/installations/${id}`);
  },

  create(data: InstallationCreateData) {
    return apiClient.post<ApiResponse<InstallationDetail>>("/installations", data);
  },

  update(id: string, data: InstallationUpdateData) {
    return apiClient.put<ApiResponse<InstallationDetail>>(`/installations/${id}`, data);
  },

  start(id: string) {
    return apiClient.post<ApiResponse<InstallationDetail>>(`/installations/${id}/start`);
  },

  complete(id: string) {
    return apiClient.post<ApiResponse<InstallationDetail>>(`/installations/${id}/complete`);
  },

  cancel(id: string) {
    return apiClient.post<ApiResponse<void>>(`/installations/${id}/cancel`);
  },
};

// ---------------------------------------------------------------------------
// Training Service
// ---------------------------------------------------------------------------

export const trainingService = {
  getAll(params?: TrainingListParams) {
    return apiClient.get<ApiResponse<TrainingListItem[]>>("/trainings", { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<TrainingDetail>>(`/trainings/${id}`);
  },

  create(data: TrainingCreateData) {
    return apiClient.post<ApiResponse<TrainingDetail>>("/trainings", data);
  },

  update(id: string, data: TrainingUpdateData) {
    return apiClient.put<ApiResponse<TrainingDetail>>(`/trainings/${id}`, data);
  },

  start(id: string) {
    return apiClient.post<ApiResponse<TrainingDetail>>(`/trainings/${id}/start`);
  },

  complete(id: string) {
    return apiClient.post<ApiResponse<TrainingDetail>>(`/trainings/${id}/complete`);
  },

  cancel(id: string) {
    return apiClient.post<ApiResponse<void>>(`/trainings/${id}/cancel`);
  },
};

// ---------------------------------------------------------------------------
// Ticket Service
// ---------------------------------------------------------------------------

export const ticketService = {
  getAll(params?: TicketListParams) {
    return apiClient.get<ApiResponse<TicketListItem[]>>("/tickets", { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<TicketDetail>>(`/tickets/${id}`);
  },

  create(data: TicketCreateData) {
    return apiClient.post<ApiResponse<TicketDetail>>("/tickets", data);
  },

  update(id: string, data: TicketUpdateData) {
    return apiClient.put<ApiResponse<TicketDetail>>(`/tickets/${id}`, data);
  },

  assign(id: string, data: AssignTicketData) {
    return apiClient.post<ApiResponse<TicketDetail>>(`/tickets/${id}/assign`, data);
  },

  resolve(id: string, data: ResolveTicketData) {
    return apiClient.post<ApiResponse<TicketDetail>>(`/tickets/${id}/resolve`, data);
  },

  close(id: string) {
    return apiClient.post<ApiResponse<TicketDetail>>(`/tickets/${id}/close`);
  },

  reopen(id: string) {
    return apiClient.post<ApiResponse<TicketDetail>>(`/tickets/${id}/reopen`);
  },

  addComment(id: string, data: AddCommentData) {
    return apiClient.post<ApiResponse<TicketComment>>(`/tickets/${id}/comments`, data);
  },
};
