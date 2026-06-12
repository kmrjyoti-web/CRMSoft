import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  workflowsService,
  workflowConfigService,
} from "../services/workflows.service";
import type {
  WorkflowListParams,
  WorkflowCreateData,
  WorkflowUpdateData,
  WorkflowStateCreateData,
  WorkflowStateUpdateData,
  WorkflowTransitionCreateData,
  WorkflowTransitionUpdateData,
} from "../types/workflows.types";

const KEY = "workflows";

// ── Workflow Admin Hooks ───────────────────────────────────

export function useWorkflowsList(params?: WorkflowListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => workflowsService.getAll(params),
  });
}

export function useWorkflowDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => workflowsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: WorkflowCreateData) => workflowsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WorkflowUpdateData }) =>
      workflowsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function usePublishWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workflowsService.publish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCloneWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workflowsService.clone(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useWorkflowVisual(id: string) {
  return useQuery({
    queryKey: [KEY, id, "visual"],
    queryFn: () => workflowsService.getVisual(id),
    enabled: !!id,
  });
}

export function useValidateWorkflow() {
  return useMutation({
    mutationFn: (id: string) => workflowsService.validate(id),
  });
}

// ── State Hooks ──────────────────────────────────────────

export function useAddState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      workflowId,
      data,
    }: {
      workflowId: string;
      data: WorkflowStateCreateData;
    }) => workflowConfigService.addState(workflowId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      stateId,
      data,
    }: {
      stateId: string;
      data: WorkflowStateUpdateData;
    }) => workflowConfigService.updateState(stateId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stateId: string) =>
      workflowConfigService.deleteState(stateId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

// ── Transition Hooks ─────────────────────────────────────

export function useAddTransition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      workflowId,
      data,
    }: {
      workflowId: string;
      data: WorkflowTransitionCreateData;
    }) => workflowConfigService.addTransition(workflowId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateTransition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      transitionId,
      data,
    }: {
      transitionId: string;
      data: WorkflowTransitionUpdateData;
    }) => workflowConfigService.updateTransition(transitionId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteTransition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (transitionId: string) =>
      workflowConfigService.deleteTransition(transitionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
