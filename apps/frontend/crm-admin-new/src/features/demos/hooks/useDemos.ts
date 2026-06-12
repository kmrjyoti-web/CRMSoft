import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { demosService } from "../services/demos.service";

import type {
  DemoListParams,
  DemoCreateData,
  DemoUpdateData,
  DemoRescheduleData,
  DemoCompleteData,
  DemoCancelData,
} from "../types/demos.types";

const KEY = "demos";

export function useDemosList(params?: DemoListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => demosService.getAll(params),
  });
}

export function useDemoDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => demosService.getById(id),
    enabled: !!id,
  });
}

export function useCreateDemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DemoCreateData) => demosService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateDemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DemoUpdateData }) =>
      demosService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRescheduleDemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: DemoRescheduleData;
    }) => demosService.reschedule(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCompleteDemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: DemoCompleteData;
    }) => demosService.complete(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCancelDemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: DemoCancelData;
    }) => demosService.cancel(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useLeadDemos(leadId: string) {
  return useQuery({
    queryKey: [KEY, "lead", leadId],
    queryFn: () => demosService.getByLead(leadId),
    enabled: !!leadId,
  });
}
