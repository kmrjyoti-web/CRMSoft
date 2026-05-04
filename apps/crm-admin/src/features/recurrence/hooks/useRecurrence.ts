import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/recurrence.service";
import type { CreateRecurrenceDto, RecurrenceFilters } from "../types/recurrence.types";

const KEY = "recurrence";

export function useRecurrences(params?: RecurrenceFilters) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => svc.listRecurrences(params),
  });
}

export function useRecurrence(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => svc.getRecurrence(id),
    enabled: !!id,
  });
}

export function useCreateRecurrence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRecurrenceDto) => svc.createRecurrence(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateRecurrence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: Partial<CreateRecurrenceDto> }) => svc.updateRecurrence(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCancelRecurrence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.cancelRecurrence(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
