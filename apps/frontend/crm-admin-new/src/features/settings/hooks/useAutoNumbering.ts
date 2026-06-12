import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { autoNumberingService } from "../services/auto-numbering.service";
import type { UpdateAutoNumberData, ResetSequenceData } from "../types/auto-numbering.types";

const KEY = "auto-numbering";

export function useAutoNumberSequences() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => autoNumberingService.getAll(),
  });
}

export function useAutoNumberSequence(entity: string) {
  return useQuery({
    queryKey: [KEY, entity],
    queryFn: () => autoNumberingService.getOne(entity),
    enabled: !!entity,
  });
}

export function useUpdateAutoNumber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entity, data }: { entity: string; data: UpdateAutoNumberData }) =>
      autoNumberingService.update(entity, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function usePreviewAutoNumber(entity: string) {
  return useQuery({
    queryKey: [KEY, entity, "preview"],
    queryFn: () => autoNumberingService.preview(entity),
    enabled: !!entity,
  });
}

export function useResetAutoNumber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entity, data }: { entity: string; data?: ResetSequenceData }) =>
      autoNumberingService.reset(entity, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
