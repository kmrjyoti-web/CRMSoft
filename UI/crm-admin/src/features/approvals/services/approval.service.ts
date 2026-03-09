import { apiClient } from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  ApprovalRequest,
  ApprovalRule,
  WorkflowApproval,
  SubmitApprovalDto,
  ApproveRejectDto,
  CreateApprovalRuleDto,
  ApprovalFilters,
} from "../types/approval.types";

const REQUESTS = "/api/v1/approval-requests";
const RULES = "/api/v1/approval-rules";
const WORKFLOW = "/api/v1/workflow-approvals";

// ── Approval Requests (Maker-Checker) ───────────────────

export function submitApproval(dto: SubmitApprovalDto) {
  return apiClient.post<ApiResponse<ApprovalRequest>>(`${REQUESTS}/submit`, dto).then((r) => r.data);
}

export function approveRequest(id: string, dto?: ApproveRejectDto) {
  return apiClient.post<ApiResponse<ApprovalRequest>>(`${REQUESTS}/${id}/approve`, dto).then((r) => r.data);
}

export function rejectRequest(id: string, dto?: ApproveRejectDto) {
  return apiClient.post<ApiResponse<ApprovalRequest>>(`${REQUESTS}/${id}/reject`, dto).then((r) => r.data);
}

export function getPendingApprovals(params?: ApprovalFilters) {
  return apiClient.get<ApiResponse<ApprovalRequest[]>>(`${REQUESTS}/pending`, { params }).then((r) => r.data);
}

export function getMyRequests(params?: ApprovalFilters) {
  return apiClient.get<ApiResponse<ApprovalRequest[]>>(`${REQUESTS}/my-requests`, { params }).then((r) => r.data);
}

export function getApprovalRequest(id: string) {
  return apiClient.get<ApiResponse<ApprovalRequest>>(`${REQUESTS}/${id}`).then((r) => r.data);
}

// ── Approval Rules ──────────────────────────────────────

export function listApprovalRules() {
  return apiClient.get<ApiResponse<ApprovalRule[]>>(RULES).then((r) => r.data);
}

export function getApprovalRule(id: string) {
  return apiClient.get<ApiResponse<ApprovalRule>>(`${RULES}/${id}`).then((r) => r.data);
}

export function createApprovalRule(dto: CreateApprovalRuleDto) {
  return apiClient.post<ApiResponse<ApprovalRule>>(RULES, dto).then((r) => r.data);
}

export function updateApprovalRule(id: string, dto: Partial<CreateApprovalRuleDto>) {
  return apiClient.put<ApiResponse<ApprovalRule>>(`${RULES}/${id}`, dto).then((r) => r.data);
}

export function deleteApprovalRule(id: string) {
  return apiClient.delete<ApiResponse<void>>(`${RULES}/${id}`).then((r) => r.data);
}

// ── Workflow Approvals ──────────────────────────────────

export function getPendingWorkflowApprovals(params?: { page?: number; limit?: number }) {
  return apiClient.get<ApiResponse<WorkflowApproval[]>>(`${WORKFLOW}/pending`, { params }).then((r) => r.data);
}

export function getWorkflowApproval(id: string) {
  return apiClient.get<ApiResponse<WorkflowApproval>>(`${WORKFLOW}/${id}`).then((r) => r.data);
}

export function getWorkflowApprovalHistory(params?: { page?: number; limit?: number }) {
  return apiClient.get<ApiResponse<WorkflowApproval[]>>(`${WORKFLOW}/history`, { params }).then((r) => r.data);
}

export function approveWorkflow(id: string, dto?: { comment?: string }) {
  return apiClient.post<ApiResponse<WorkflowApproval>>(`${WORKFLOW}/${id}/approve`, dto).then((r) => r.data);
}

export function rejectWorkflow(id: string, dto?: { comment?: string }) {
  return apiClient.post<ApiResponse<WorkflowApproval>>(`${WORKFLOW}/${id}/reject`, dto).then((r) => r.data);
}
