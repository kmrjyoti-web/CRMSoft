import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/price-groups.service";
import type { CreatePriceGroupDto, AddMembersDto, PriceGroupFilters } from "../types/price-groups.types";

const KEY = "price-groups";

export function usePriceGroups(params?: PriceGroupFilters) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => svc.listGroups(params),
  });
}

export function usePriceGroup(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => svc.getGroup(id),
    enabled: !!id,
  });
}

export function useCreatePriceGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePriceGroupDto) => svc.createGroup(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdatePriceGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: Partial<CreatePriceGroupDto> }) => svc.updateGroup(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeactivatePriceGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deactivateGroup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function usePriceGroupMembers(id: string) {
  return useQuery({
    queryKey: [KEY, id, "members"],
    queryFn: () => svc.getMembers(id),
    enabled: !!id,
  });
}

export function useAddPriceGroupMembers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: AddMembersDto }) => svc.addMembers(vars.id, vars.dto),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }),
  });
}

export function useRemovePriceGroupMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; mappingId: string }) => svc.removeMember(vars.id, vars.mappingId),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }),
  });
}
