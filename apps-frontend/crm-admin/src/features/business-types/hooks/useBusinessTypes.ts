import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/business-types.service";
import type { AssignBusinessTypeDto, UpdateTradeProfileDto, UpsertTerminologyDto, BulkTerminologyDto } from "../types/business-types.types";

const KEY = "business-types";

export function useBusinessTypes(activeOnly?: boolean) {
  return useQuery({
    queryKey: [KEY, { activeOnly }],
    queryFn: () => svc.listTypes(activeOnly),
  });
}

export function useBusinessTypeByCode(code: string) {
  return useQuery({
    queryKey: [KEY, code],
    queryFn: () => svc.getByCode(code),
    enabled: !!code,
  });
}

export function useBusinessProfile() {
  return useQuery({
    queryKey: [KEY, "profile"],
    queryFn: () => svc.getProfile(),
  });
}

export function useSeedBusinessTypes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => svc.seedDefaults(),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useAssignBusinessType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AssignBusinessTypeDto) => svc.assignType(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateTradeProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateTradeProfileDto) => svc.updateTradeProfile(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "profile"] }),
  });
}

export function useResolvedTerminology() {
  return useQuery({
    queryKey: [KEY, "terminology", "resolved"],
    queryFn: () => svc.getResolvedTerminology(),
  });
}

export function useTerminologyOverrides() {
  return useQuery({
    queryKey: [KEY, "terminology", "overrides"],
    queryFn: () => svc.getTerminologyOverrides(),
  });
}

export function useUpsertTerminology() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpsertTerminologyDto) => svc.upsertTerminology(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "terminology"] }),
  });
}

export function useBulkUpsertTerminology() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: BulkTerminologyDto) => svc.bulkUpsertTerminology(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "terminology"] }),
  });
}

export function useDeleteTerminology() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (termKey: string) => svc.deleteTerminology(termKey),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "terminology"] }),
  });
}
