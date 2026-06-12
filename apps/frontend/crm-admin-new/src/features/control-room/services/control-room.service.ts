import apiClient from "@/services/api-client";
import type { ControlRoomGroupedResponse, ControlRoomAuditEntry, UpdateRulePayload } from "../types/control-room.types";

const BASE_URL = "/api/v1/control-room";

export const controlRoomService = {
  getRulesGrouped: () =>
    apiClient.get<{ data: ControlRoomGroupedResponse }>(BASE_URL).then((r) => r.data),

  updateRule: (ruleCode: string, data: UpdateRulePayload) =>
    apiClient.patch<{ data: unknown }>(`${BASE_URL}/rules/${ruleCode}`, data).then((r) => r.data),

  resetRule: (ruleCode: string, level: string) =>
    apiClient.delete<{ data: unknown }>(`${BASE_URL}/rules/${ruleCode}/reset`, { params: { level } }).then((r) => r.data),

  getAuditTrail: (ruleCode?: string) =>
    apiClient.get<{ data: ControlRoomAuditEntry[] }>(
      ruleCode ? `${BASE_URL}/audit/${ruleCode}` : `${BASE_URL}/audit`,
    ).then((r) => r.data),

  // Draft mode
  saveDraft: (ruleCode: string, data: UpdateRulePayload) =>
    apiClient.patch<{ data: unknown }>(`${BASE_URL}/draft/${ruleCode}`, data).then((r) => r.data),

  getPendingDrafts: () =>
    apiClient.get<{ data: unknown[] }>(`${BASE_URL}/drafts`).then((r) => r.data),

  discardDraft: (draftId: string) =>
    apiClient.delete<{ data: unknown }>(`${BASE_URL}/draft/${draftId}`).then((r) => r.data),

  discardAllDrafts: () =>
    apiClient.delete<{ data: unknown }>(`${BASE_URL}/drafts/all`).then((r) => r.data),

  applyAllDrafts: (changeReason: string) =>
    apiClient.patch<{ data: unknown }>(`${BASE_URL}/apply`, { changeReason }).then((r) => r.data),
};
