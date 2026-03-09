import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  Campaign,
  CampaignRecipient,
  CampaignStats,
  Unsubscribe,
  CreateCampaignDto,
  UpdateCampaignDto,
  AddRecipientsDto,
  CampaignFilters,
} from "../types/campaign.types";

const BASE = "/api/v1/email-campaigns";

// ── CRUD ────────────────────────────────────────────────

export function listCampaigns(params?: CampaignFilters) {
  return apiClient.get<ApiResponse<Campaign[]>>(BASE, { params }).then((r) => r.data);
}

export function getCampaign(id: string) {
  return apiClient.get<ApiResponse<Campaign>>(`${BASE}/${id}`).then((r) => r.data);
}

export function createCampaign(dto: CreateCampaignDto) {
  return apiClient.post<ApiResponse<Campaign>>(BASE, dto).then((r) => r.data);
}

export function updateCampaign(id: string, dto: UpdateCampaignDto) {
  return apiClient.put<ApiResponse<Campaign>>(`${BASE}/${id}`, dto).then((r) => r.data);
}

// ── Recipients ──────────────────────────────────────────

export function getCampaignRecipients(id: string, params?: { page?: number; limit?: number }) {
  return apiClient.get<ApiResponse<CampaignRecipient[]>>(`${BASE}/${id}/recipients`, { params }).then((r) => r.data);
}

export function addRecipients(id: string, dto: AddRecipientsDto) {
  return apiClient.post<ApiResponse<{ added: number }>>(`${BASE}/${id}/recipients`, dto).then((r) => r.data);
}

// ── Actions ─────────────────────────────────────────────

export function startCampaign(id: string) {
  return apiClient.post<ApiResponse<Campaign>>(`${BASE}/${id}/start`).then((r) => r.data);
}

export function pauseCampaign(id: string) {
  return apiClient.post<ApiResponse<Campaign>>(`${BASE}/${id}/pause`).then((r) => r.data);
}

export function cancelCampaign(id: string) {
  return apiClient.post<ApiResponse<Campaign>>(`${BASE}/${id}/cancel`).then((r) => r.data);
}

// ── Stats & Unsubscribes ────────────────────────────────

export function getCampaignStats(id: string) {
  return apiClient.get<ApiResponse<CampaignStats>>(`${BASE}/${id}/stats`).then((r) => r.data);
}

export function listUnsubscribes(params?: { page?: number; limit?: number }) {
  return apiClient.get<ApiResponse<Unsubscribe[]>>(`${BASE}/unsubscribes`, { params }).then((r) => r.data);
}
