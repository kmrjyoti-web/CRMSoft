import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { rolesService } from "../services/roles.service";

import type {
  RoleListParams,
  RoleCreateData,
  RoleUpdateData,
} from "../types/settings.types";

const KEY = "roles";

export function useRolesList(params?: RoleListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => rolesService.getAll(params),
  });
}

export function useRoleDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => rolesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RoleCreateData) => rolesService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoleUpdateData }) =>
      rolesService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rolesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
