import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { usersService } from "../services/users.service";

import type {
  UserListParams,
  UserCreateData,
  UserUpdateData,
} from "../types/settings.types";

const KEY = "users";

export function useUsersList(params?: UserListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => usersService.getAll(params),
  });
}

export function useUserDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => usersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserCreateData) => usersService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateData }) =>
      usersService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useActivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSoftDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.softDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["recycle-bin"] });
    },
  });
}

export function useRestoreUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["recycle-bin"] });
    },
  });
}

export function usePermanentDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.permanentDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recycle-bin"] }),
  });
}
