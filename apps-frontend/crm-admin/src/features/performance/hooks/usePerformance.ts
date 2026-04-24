import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/performance.service";
import type { CreateTargetDto } from "../types/performance.types";

const KEY = "performance";

export function useLeaderboard(params?: { period?: string; teamId?: string; limit?: number }) {
  return useQuery({
    queryKey: [KEY, "leaderboard", params],
    queryFn: () => svc.getLeaderboard(params),
  });
}

export function useTeamPerformance(params?: { period?: string; teamId?: string }) {
  return useQuery({
    queryKey: [KEY, "team", params],
    queryFn: () => svc.getTeamPerformance(params),
  });
}

export function useTargets(params?: { scope?: string; userId?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: [KEY, "targets", params],
    queryFn: () => svc.listTargets(params),
  });
}

export function useUserProgress(userId: string) {
  return useQuery({
    queryKey: [KEY, "tracking", userId],
    queryFn: () => svc.getUserProgress(userId),
    enabled: !!userId,
  });
}

export function useCreateTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTargetDto) => svc.createTarget(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "targets"] }),
  });
}

export function useUpdateTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: Partial<CreateTargetDto> }) => svc.updateTarget(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "targets"] }),
  });
}

export function useDeleteTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteTarget(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "targets"] }),
  });
}
