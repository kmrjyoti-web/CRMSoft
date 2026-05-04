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

const INSTALLATIONS_URL = "/api/v1/installations";
const TRAININGS_URL = "/api/v1/trainings";
const TICKETS_URL = "/api/v1/tickets";

export const installationService = {
  getAll(params?: InstallationListParams) {
    return apiClient.get<ApiResponse<InstallationListItem[]>>(INSTALLATIONS_URL, { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<InstallationDetail>>(`${INSTALLATIONS_URL}/${id}`);
  },

  create(data: InstallationCreateData) {
    return apiClient.post<ApiResponse<InstallationDetail>>(INSTALLATIONS_URL, data);
  },

  update(id: string, data: InstallationUpdateData) {
    return apiClient.put<ApiResponse<InstallationDetail>>(`${INSTALLATIONS_URL}/${id}`, data);
  },

  start(id: string) {
    return apiClient.post<ApiResponse<InstallationDetail>>(`${INSTALLATIONS_URL}/${id}/start`);
  },

  complete(id: string) {
    return apiClient.post<ApiResponse<InstallationDetail>>(`${INSTALLATIONS_URL}/${id}/complete`);
  },

  cancel(id: string) {
    return apiClient.post<ApiResponse<void>>(`${INSTALLATIONS_URL}/${id}/cancel`);
  },
};

// ---------------------------------------------------------------------------
// Training Service
// ---------------------------------------------------------------------------

export const trainingService = {
  getAll(params?: TrainingListParams) {
    return apiClient.get<ApiResponse<TrainingListItem[]>>(TRAININGS_URL, { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<TrainingDetail>>(`${TRAININGS_URL}/${id}`);
  },

  create(data: TrainingCreateData) {
    return apiClient.post<ApiResponse<TrainingDetail>>(TRAININGS_URL, data);
  },

  update(id: string, data: TrainingUpdateData) {
    return apiClient.put<ApiResponse<TrainingDetail>>(`${TRAININGS_URL}/${id}`, data);
  },

  start(id: string) {
    return apiClient.post<ApiResponse<TrainingDetail>>(`${TRAININGS_URL}/${id}/start`);
  },

  complete(id: string) {
    return apiClient.post<ApiResponse<TrainingDetail>>(`${TRAININGS_URL}/${id}/complete`);
  },

  cancel(id: string) {
    return apiClient.post<ApiResponse<void>>(`${TRAININGS_URL}/${id}/cancel`);
  },
};

// ---------------------------------------------------------------------------
// Ticket Service
// ---------------------------------------------------------------------------

export const ticketService = {
  getAll(params?: TicketListParams) {
    return apiClient.get<ApiResponse<TicketListItem[]>>(TICKETS_URL, { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<TicketDetail>>(`${TICKETS_URL}/${id}`);
  },

  create(data: TicketCreateData) {
    return apiClient.post<ApiResponse<TicketDetail>>(TICKETS_URL, data);
  },

  update(id: string, data: TicketUpdateData) {
    return apiClient.put<ApiResponse<TicketDetail>>(`${TICKETS_URL}/${id}`, data);
  },

  assign(id: string, data: AssignTicketData) {
    return apiClient.post<ApiResponse<TicketDetail>>(`${TICKETS_URL}/${id}/assign`, data);
  },

  resolve(id: string, data: ResolveTicketData) {
    return apiClient.post<ApiResponse<TicketDetail>>(`${TICKETS_URL}/${id}/resolve`, data);
  },

  close(id: string) {
    return apiClient.post<ApiResponse<TicketDetail>>(`${TICKETS_URL}/${id}/close`);
  },

  reopen(id: string) {
    return apiClient.post<ApiResponse<TicketDetail>>(`${TICKETS_URL}/${id}/reopen`);
  },

  addComment(id: string, data: AddCommentData) {
    return apiClient.post<ApiResponse<TicketComment>>(`${TICKETS_URL}/${id}/comments`, data);
  },
};
