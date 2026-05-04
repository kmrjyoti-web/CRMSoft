import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/approval.service";
import type { SubmitApprovalDto, ApproveRejectDto, CreateApprovalRuleDto, ApprovalFilters } from "../types/approval.types";

const KEY = "approvals";

// ── Approval Requests ───────────────────────────────────

export function usePendingApprovals(params?: ApprovalFilters) {
  return useQuery({
    queryKey: [KEY, "pending", params],
    queryFn: () => svc.getPendingApprovals(params),
  });
}

export function useMyRequests(params?: ApprovalFilters) {
  return useQuery({
    queryKey: [KEY, "my-requests", params],
    queryFn: () => svc.getMyRequests(params),
  });
}

export function useApprovalRequest(id: string) {
  return useQuery({
    queryKey: [KEY, "request", id],
    queryFn: () => svc.getApprovalRequest(id),
    enabled: !!id,
  });
}

// ── Approval Rules ──────────────────────────────────────

export function useApprovalRules() {
  return useQuery({
    queryKey: [KEY, "rules"],
    queryFn: () => svc.listApprovalRules(),
  });
}

export function useApprovalRule(id: string) {
  return useQuery({
    queryKey: [KEY, "rules", id],
    queryFn: () => svc.getApprovalRule(id),
    enabled: !!id,
  });
}

// ── Workflow Approvals ──────────────────────────────────

export function usePendingWorkflowApprovals(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [KEY, "workflow-pending", params],
    queryFn: () => svc.getPendingWorkflowApprovals(params),
  });
}

export function useWorkflowApproval(id: string) {
  return useQuery({
    queryKey: [KEY, "workflow", id],
    queryFn: () => svc.getWorkflowApproval(id),
    enabled: !!id,
  });
}

export function useWorkflowApprovalHistory(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [KEY, "workflow-history", params],
    queryFn: () => svc.getWorkflowApprovalHistory(params),
  });
}

// ── Mutations ───────────────────────────────────────────

export function useSubmitApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: SubmitApprovalDto) => svc.submitApproval(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useApproveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto?: ApproveRejectDto }) => svc.approveRequest(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRejectRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto?: ApproveRejectDto }) => svc.rejectRequest(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCreateApprovalRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateApprovalRuleDto) => svc.createApprovalRule(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "rules"] }),
  });
}

export function useUpdateApprovalRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: Partial<CreateApprovalRuleDto> }) => svc.updateApprovalRule(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "rules"] }),
  });
}

export function useDeleteApprovalRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteApprovalRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "rules"] }),
  });
}

export function useApproveWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; comment?: string }) => svc.approveWorkflow(vars.id, { comment: vars.comment }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRejectWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; comment?: string }) => svc.rejectWorkflow(vars.id, { comment: vars.comment }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
