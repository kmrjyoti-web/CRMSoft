import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { menusAdminService } from "../services/menus.service";
import type {
  MenuCreateData,
  MenuUpdateData,
  MenuReorderData,
} from "../types/settings.types";

const KEY = "menus-admin";

export function useMenuTree() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => menusAdminService.getTree(),
  });
}

export function useCreateMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MenuCreateData) => menusAdminService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MenuUpdateData }) =>
      menusAdminService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeactivateMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menusAdminService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useReorderMenus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MenuReorderData) => menusAdminService.reorder(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useResetMenuDefaults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => menusAdminService.resetDefaults(),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
