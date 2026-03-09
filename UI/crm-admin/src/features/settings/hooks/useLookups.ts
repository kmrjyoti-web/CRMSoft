import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { lookupsService } from "../services/lookups.service";

import type {
  LookupCreateData,
  LookupUpdateData,
  LookupValueCreateData,
  LookupValueUpdateData,
} from "../types/lookup.types";

const KEY = "lookups-admin";

export function useLookupsList(activeOnly = true) {
  return useQuery({
    queryKey: [KEY, { activeOnly }],
    queryFn: () => lookupsService.getAll(activeOnly),
  });
}

export function useLookupDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => lookupsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateLookup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LookupCreateData) => lookupsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateLookup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LookupUpdateData }) =>
      lookupsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeactivateLookup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lookupsService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

// ── Value mutations ──────────────────────────────────────

export function useAddLookupValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lookupId, data }: { lookupId: string; data: LookupValueCreateData }) =>
      lookupsService.addValue(lookupId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateLookupValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ valueId, data }: { valueId: string; data: LookupValueUpdateData }) =>
      lookupsService.updateValue(valueId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeactivateLookupValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (valueId: string) => lookupsService.deactivateValue(valueId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useResetLookupDefaults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => lookupsService.resetDefaults(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["lookup"] });
    },
  });
}
