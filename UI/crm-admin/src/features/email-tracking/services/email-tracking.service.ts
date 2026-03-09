import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  EmailTrackingEvent,
  EmailTrackingSummary,
  EmailTrackingFilters,
} from "../types/email-tracking.types";

const BASE = "/email-tracking";

// Note: open/click/bounce endpoints are public (no auth) — used by email clients.
// The admin UI queries communication logs for tracking data.

export function getTrackingEvents(filters?: EmailTrackingFilters) {
  return apiClient.get<ApiResponse<EmailTrackingEvent[]>>(`${BASE}/events`, { params: filters }).then((r) => r.data);
}

export function getTrackingSummary(filters?: { fromDate?: string; toDate?: string }) {
  return apiClient.get<ApiResponse<EmailTrackingSummary>>(`${BASE}/summary`, { params: filters }).then((r) => r.data);
}

export function getEmailEvents(emailId: string) {
  return apiClient.get<ApiResponse<EmailTrackingEvent[]>>(`${BASE}/events/${emailId}`).then((r) => r.data);
}
