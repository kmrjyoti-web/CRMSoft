import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/saved-filters.service";
import type { EntityFilterAssignDto, FilterSearchDto } from "../types/saved-filters.types";

const KEY = "entity-filters";

export function useEntityFilters(entityType: string, entityId: string) {
  return useQuery({
    queryKey: [KEY, entityType, entityId],
    queryFn: () => svc.getEntityFilters(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useAssignFilters() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { entityType: string; entityId: string; dto: EntityFilterAssignDto }) =>
      svc.assignFilters(vars.entityType, vars.entityId, vars.dto),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.entityType, vars.entityId] }),
  });
}

export function useReplaceFilters() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { entityType: string; entityId: string; dto: EntityFilterAssignDto & { category?: string } }) =>
      svc.replaceFilters(vars.entityType, vars.entityId, vars.dto),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.entityType, vars.entityId] }),
  });
}

export function useRemoveFilter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { entityType: string; entityId: string; lookupValueId: string }) =>
      svc.removeFilter(vars.entityType, vars.entityId, vars.lookupValueId),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.entityType, vars.entityId] }),
  });
}

export function useCopyFilters() {
  return useMutation({
    mutationFn: (vars: { entityType: string; entityId: string; dto: { targetEntityType: string; targetEntityId: string } }) =>
      svc.copyFilters(vars.entityType, vars.entityId, vars.dto),
  });
}

export function useFilterSearch() {
  return useMutation({
    mutationFn: (vars: { entityType: string; dto: FilterSearchDto }) =>
      svc.searchByFilters(vars.entityType, vars.dto),
  });
}
