import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/follow-ups.service";
import type {
  CreateFollowUpDto,
  SnoozeFollowUpDto,
  ReassignFollowUpDto,
  CompleteFollowUpDto,
  FollowUpFilters,
} from "../types/follow-ups.types";

const KEY = "follow-ups";

export function useFollowUps(params?: FollowUpFilters) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => svc.listFollowUps(params),
  });
}

export function useFollowUp(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => svc.getFollowUp(id),
    enabled: !!id,
  });
}

export function useOverdueFollowUps(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [KEY, "overdue", params],
    queryFn: () => svc.getOverdueFollowUps(params),
  });
}

export function useFollowUpStats(params?: { userId?: string; fromDate?: string; toDate?: string }) {
  return useQuery({
    queryKey: [KEY, "stats", params],
    queryFn: () => svc.getFollowUpStats(params),
  });
}

export function useCreateFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFollowUpDto) => svc.createFollowUp(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: Partial<CreateFollowUpDto> }) => svc.updateFollowUp(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteFollowUp(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCompleteFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto?: CompleteFollowUpDto }) => svc.completeFollowUp(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSnoozeFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: SnoozeFollowUpDto }) => svc.snoozeFollowUp(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useReassignFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: ReassignFollowUpDto }) => svc.reassignFollowUp(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
