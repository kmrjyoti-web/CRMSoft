import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { designationsService } from "../services/designations.service";

import type {
  DesignationCreateData,
  DesignationUpdateData,
  DesignationListParams,
} from "../types/designation.types";

const KEY = "designations";

export function useDesignationsList(params?: DesignationListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => designationsService.getAll(params),
  });
}

export function useDesignationDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => designationsService.getById(id),
    enabled: !!id,
  });
}

export function useDesignationTree(departmentId?: string) {
  return useQuery({
    queryKey: [KEY, "tree", departmentId],
    queryFn: () => designationsService.getTree(departmentId),
  });
}

export function useCreateDesignation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DesignationCreateData) => designationsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateDesignation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DesignationUpdateData }) =>
      designationsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeactivateDesignation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => designationsService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
