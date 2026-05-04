import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/user-overrides.service";
import type { GrantPermissionDto, DenyPermissionDto } from "../types/user-overrides.types";

const KEY = "user-overrides";

export function useAllOverrides() {
  return useQuery({ queryKey: [KEY], queryFn: svc.listAllOverrides });
}

export function useUserOverrides(userId: string) {
  return useQuery({ queryKey: [KEY, userId], queryFn: () => svc.getUserOverrides(userId), enabled: !!userId });
}

export function useGrantPermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, dto }: { userId: string; dto: GrantPermissionDto }) => svc.grantPermission(userId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDenyPermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, dto }: { userId: string; dto: DenyPermissionDto }) => svc.denyPermission(userId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRevokeOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, action }: { userId: string; action: string }) => svc.revokeOverride(userId, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
