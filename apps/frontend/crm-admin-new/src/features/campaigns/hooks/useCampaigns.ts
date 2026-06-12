import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/campaign.service";
import type { CreateCampaignDto, UpdateCampaignDto, AddRecipientsDto, CampaignFilters } from "../types/campaign.types";

const KEY = "campaigns";

// ── Queries ─────────────────────────────────────────────

export function useCampaigns(params?: CampaignFilters) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => svc.listCampaigns(params),
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => svc.getCampaign(id),
    enabled: !!id,
  });
}

export function useCampaignStats(id: string) {
  return useQuery({
    queryKey: [KEY, id, "stats"],
    queryFn: () => svc.getCampaignStats(id),
    enabled: !!id,
  });
}

export function useCampaignRecipients(id: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [KEY, id, "recipients", params],
    queryFn: () => svc.getCampaignRecipients(id, params),
    enabled: !!id,
  });
}

export function useUnsubscribes(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [KEY, "unsubscribes", params],
    queryFn: () => svc.listUnsubscribes(params),
  });
}

// ── Mutations ───────────────────────────────────────────

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCampaignDto) => svc.createCampaign(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: UpdateCampaignDto }) => svc.updateCampaign(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useAddRecipients() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: AddRecipientsDto }) => svc.addRecipients(vars.id, vars.dto),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }),
  });
}

export function useStartCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.startCampaign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function usePauseCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.pauseCampaign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCancelCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.cancelCampaign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
