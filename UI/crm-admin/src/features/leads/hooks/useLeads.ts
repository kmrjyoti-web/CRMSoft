import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { leadsService } from "../services/leads.service";

import type {
  LeadListParams,
  LeadCreateData,
  LeadUpdateData,
} from "../types/leads.types";

const KEY = "leads";

export function useLeadsList(params?: LeadListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => leadsService.getAll(params),
  });
}

export function useLeadDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => leadsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LeadCreateData) => leadsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LeadUpdateData }) =>
      leadsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useChangeLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: string;
      reason?: string;
    }) => leadsService.changeStatus(id, { status, reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useAllocateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      allocatedToId,
    }: {
      id: string;
      allocatedToId: string;
    }) => leadsService.allocate(id, { allocatedToId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useLeadTransitions(id: string) {
  return useQuery({
    queryKey: [KEY, id, "transitions"],
    queryFn: () => leadsService.getTransitions(id),
    enabled: !!id,
  });
}

export function useDeactivateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useReactivateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsService.reactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSoftDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsService.softDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["recycle-bin"] });
    },
  });
}

export function useRestoreLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["recycle-bin"] });
    },
  });
}

export function usePermanentDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsService.permanentDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recycle-bin"] }),
  });
}
