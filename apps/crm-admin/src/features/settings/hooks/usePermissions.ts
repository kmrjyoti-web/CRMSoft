import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { permissionsService } from "../services/permissions.service";

const KEY = "permissions";

export function usePermissionsList() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => permissionsService.getAll(),
  });
}

export function usePermissionMatrix() {
  return useQuery({
    queryKey: [KEY, "matrix"],
    queryFn: () => permissionsService.getMatrix(),
  });
}

export function useUpdateRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => permissionsService.updateRolePermissions(roleId, permissionIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: [KEY] });
    },
  });
}
