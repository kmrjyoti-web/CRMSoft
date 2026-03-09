import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/business-locations.service";
import type { CreateLocationDto, LocationFilters, LinkOrganizationDto } from "../types/business-locations.types";

const KEY = "business-locations";

export function useBusinessLocations(params?: LocationFilters) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => svc.listLocations(params),
  });
}

export function useLocationTree() {
  return useQuery({
    queryKey: [KEY, "tree"],
    queryFn: () => svc.getLocationTree(),
  });
}

export function useBusinessLocation(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => svc.getLocation(id),
    enabled: !!id,
  });
}

export function useLocationChildren(id: string) {
  return useQuery({
    queryKey: [KEY, id, "children"],
    queryFn: () => svc.getChildren(id),
    enabled: !!id,
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLocationDto) => svc.createLocation(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: Partial<CreateLocationDto> }) => svc.updateLocation(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteLocation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCountries() {
  return useQuery({
    queryKey: [KEY, "countries"],
    queryFn: () => svc.getCountries(),
    staleTime: 1000 * 60 * 30,
  });
}

export function useLinkLocationOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: LinkOrganizationDto }) => svc.linkOrganization(vars.id, vars.dto),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }),
  });
}

export function useUnlinkLocationOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; orgId: string }) => svc.unlinkOrganization(vars.id, vars.orgId),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }),
  });
}
