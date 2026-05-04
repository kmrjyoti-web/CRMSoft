import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { departmentsService } from "../services/departments.service";

import type {
  DepartmentCreateData,
  DepartmentUpdateData,
  DepartmentListParams,
} from "../types/department.types";

const KEY = "departments";

export function useDepartmentsList(params?: DepartmentListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => departmentsService.getAll(params),
  });
}

export function useDepartmentDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => departmentsService.getById(id),
    enabled: !!id,
  });
}

export function useDepartmentTree() {
  return useQuery({
    queryKey: [KEY, "tree"],
    queryFn: () => departmentsService.getTree(),
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DepartmentCreateData) => departmentsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DepartmentUpdateData }) =>
      departmentsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeactivateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentsService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSetDepartmentHead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      departmentsService.setHead(id, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
