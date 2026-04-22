import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

const LEADS_URL = "/api/v1/leads";

// ── Types ─────────────────────────────────────────────────

export interface WorkflowStatusState {
  id: string;
  name: string;
  code: string;
  stateType: string;
  category?: string | null;
  color?: string | null;
}

export interface WorkflowEntityStatus {
  instanceId: string;
  workflowId: string;
  workflowName: string;
  currentState: WorkflowStatusState;
  previousState: { id: string; name: string; code: string } | null;
  startedAt: string;
  completedAt: string | null;
  isActive: boolean;
}

export interface WorkflowAvailableTransition {
  id: string;
  code: string;
  name: string;
  triggerType: string;
  toState: {
    id: string;
    name: string;
    code: string;
    color?: string | null;
  };
}

export interface WorkflowTransitionResult {
  instanceId: string;
  fromState: string;
  toState: string;
  action: string;
  historyId: string;
}

export interface WorkflowHistoryEntry {
  id: string;
  action: string;
  performedById: string;
  performedByName: string;
  comment?: string | null;
  createdAt: string;
  fromState?: { id: string; name: string; code: string; color?: string | null } | null;
  toState?: { id: string; name: string; code: string; color?: string | null } | null;
  transition?: { id: string; name: string; code: string } | null;
}

// ── Lead Workflow Service ─────────────────────────────────

export const leadWorkflowService = {
  getStatus: (leadId: string) =>
    apiClient
      .get<ApiResponse<WorkflowEntityStatus | null>>(`${LEADS_URL}/${leadId}/workflow-status`)
      .then((r) => r.data),

  getTransitions: (leadId: string) =>
    apiClient
      .get<ApiResponse<WorkflowAvailableTransition[]>>(`${LEADS_URL}/${leadId}/workflow-transitions`)
      .then((r) => r.data),

  executeTransition: (leadId: string, transitionCode: string, comment?: string) =>
    apiClient
      .post<ApiResponse<WorkflowTransitionResult>>(`${LEADS_URL}/${leadId}/workflow-transition`, {
        transitionCode,
        comment,
      })
      .then((r) => r.data),

  getHistory: (leadId: string) =>
    apiClient
      .get<ApiResponse<WorkflowHistoryEntry[]>>(`${LEADS_URL}/${leadId}/workflow-history`)
      .then((r) => r.data),
};
