import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/ownership.service";
import type {
  AssignOwnerDto,
  TransferOwnerDto,
  DelegateOwnershipDto,
  BulkAssignDto,
  UpdateCapacityDto,
  EntityType,
} from "../types/ownership.types";

const KEY = "ownership";

// ── Queries ─────────────────────────────────────────────

export function useEntityOwners(entityType: EntityType, entityId: string) {
  return useQuery({
    queryKey: [KEY, "entity", entityType, entityId],
    queryFn: () => svc.getEntityOwners(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useUserEntities(userId: string) {
  return useQuery({
    queryKey: [KEY, "user", userId],
    queryFn: () => svc.getUserEntities(userId),
    enabled: !!userId,
  });
}

export function useMyEntities() {
  return useQuery({
    queryKey: [KEY, "my-entities"],
    queryFn: () => svc.getMyEntities(),
  });
}

export function useOwnershipHistory(entityType: EntityType, entityId: string) {
  return useQuery({
    queryKey: [KEY, "history", entityType, entityId],
    queryFn: () => svc.getOwnershipHistory(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useUnassignedEntities(params?: { entityType?: EntityType; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [KEY, "unassigned", params],
    queryFn: () => svc.getUnassignedEntities(params),
  });
}

export function useOwnershipStats() {
  return useQuery({
    queryKey: [KEY, "stats"],
    queryFn: () => svc.getOwnershipStats(),
  });
}

export function useRecentChanges() {
  return useQuery({
    queryKey: [KEY, "recent-changes"],
    queryFn: () => svc.getRecentChanges(),
  });
}

export function useDelegationStatus() {
  return useQuery({
    queryKey: [KEY, "delegation-status"],
    queryFn: () => svc.getDelegationStatus(),
  });
}

// ── Assignment Rules ────────────────────────────────────

export function useAssignmentRules() {
  return useQuery({
    queryKey: [KEY, "rules"],
    queryFn: () => svc.listAssignmentRules(),
  });
}

export function useAssignmentRule(id: string) {
  return useQuery({
    queryKey: [KEY, "rules", id],
    queryFn: () => svc.getAssignmentRule(id),
    enabled: !!id,
  });
}

// ── Workload ────────────────────────────────────────────

export function useWorkloadDashboard() {
  return useQuery({
    queryKey: [KEY, "workload"],
    queryFn: () => svc.getWorkloadDashboard(),
  });
}

export function useUserWorkload(userId: string) {
  return useQuery({
    queryKey: [KEY, "workload", userId],
    queryFn: () => svc.getUserWorkload(userId),
    enabled: !!userId,
  });
}

export function useRebalanceSuggestions() {
  return useQuery({
    queryKey: [KEY, "rebalance"],
    queryFn: () => svc.getRebalanceSuggestions(),
  });
}

// ── Mutations ───────────────────────────────────────────

export function useAssignOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AssignOwnerDto) => svc.assignOwner(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useTransferOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: TransferOwnerDto) => svc.transferOwner(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRevokeOwner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { entityType: EntityType; entityId: string; userId: string }) =>
      svc.revokeOwner(vars.entityType, vars.entityId, vars.userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useBulkAssign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: BulkAssignDto) => svc.bulkAssign(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDelegateOwnership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: DelegateOwnershipDto) => svc.delegateOwnership(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRevertDelegation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.revertDelegation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCreateAssignmentRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Partial<import("../types/ownership.types").AssignmentRule>) => svc.createAssignmentRule(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "rules"] }),
  });
}

export function useUpdateAssignmentRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: Partial<import("../types/ownership.types").AssignmentRule> }) =>
      svc.updateAssignmentRule(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "rules"] }),
  });
}

export function useDeleteAssignmentRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteAssignmentRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "rules"] }),
  });
}

export function useTriggerAutoAssign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => svc.triggerAutoAssign(),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateCapacity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { userId: string; dto: UpdateCapacityDto }) =>
      svc.updateUserCapacity(vars.userId, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "workload"] }),
  });
}

export function useSetAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { userId: string; isAvailable: boolean; unavailableFrom?: string; unavailableTo?: string; delegateToId?: string }) =>
      svc.setUserAvailability(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "workload"] }),
  });
}
