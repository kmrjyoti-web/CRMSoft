import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/business-locations.service";
import type {
  CreateLocationDto, LocationFilters, LinkOrganizationDto,
  AddCountryDto, AddStatesDto, AddCitiesDto, AddPincodesDto, AddPincodeRangeDto,
} from "../types/business-locations.types";

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

// ─── Company Operating Location Hooks ────────────────────────────────────────

const CLOC_KEY = "company-locations";

export function useCompanyLocationTree() {
  return useQuery({
    queryKey: [CLOC_KEY, "tree"],
    queryFn: () => svc.getCompanyLocationTree(),
    staleTime: 30_000,
  });
}

export function useLocationSummary() {
  return useQuery({
    queryKey: [CLOC_KEY, "summary"],
    queryFn: () => svc.getLocationSummary(),
    staleTime: 30_000,
  });
}

export function usePackageCountries() {
  return useQuery({
    queryKey: [CLOC_KEY, "pkg-countries"],
    queryFn: () => svc.getPackageCountries(),
    staleTime: Infinity,
  });
}

export function usePackageStates(countryCode: string) {
  return useQuery({
    queryKey: [CLOC_KEY, "pkg-states", countryCode],
    queryFn: () => svc.getPackageStates(countryCode),
    enabled: !!countryCode,
    staleTime: Infinity,
  });
}

export function usePackageCities(countryCode: string, stateCode: string) {
  return useQuery({
    queryKey: [CLOC_KEY, "pkg-cities", countryCode, stateCode],
    queryFn: () => svc.getPackageCities(countryCode, stateCode),
    enabled: !!(countryCode && stateCode),
    staleTime: Infinity,
  });
}

export function useGstStateCodes() {
  return useQuery({
    queryKey: [CLOC_KEY, "gst-codes"],
    queryFn: () => svc.getGstStateCodes(),
    staleTime: Infinity,
  });
}

function invalidateTree(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: [CLOC_KEY] });
}

export function useAddCompanyCountry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AddCountryDto) => svc.addCompanyCountry(dto),
    onSuccess: () => invalidateTree(qc),
  });
}

export function useRemoveCompanyCountry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.removeCompanyCountry(id),
    onSuccess: () => invalidateTree(qc),
  });
}

export function useAddCompanyStates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { countryId: string; dto: AddStatesDto }) =>
      svc.addCompanyStates(vars.countryId, vars.dto),
    onSuccess: () => invalidateTree(qc),
  });
}

export function useUpdateCompanyState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; data: Partial<{ coverageType: string; isHeadquarter: boolean; stateGstin: string }> }) =>
      svc.updateCompanyState(vars.id, vars.data),
    onSuccess: () => invalidateTree(qc),
  });
}

export function useRemoveCompanyState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.removeCompanyState(id),
    onSuccess: () => invalidateTree(qc),
  });
}

export function useAddCompanyCities() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { stateId: string; dto: AddCitiesDto }) =>
      svc.addCompanyCities(vars.stateId, vars.dto),
    onSuccess: () => invalidateTree(qc),
  });
}

export function useUpdateCompanyCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; data: Partial<{ coverageType: string; district: string }> }) =>
      svc.updateCompanyCity(vars.id, vars.data),
    onSuccess: () => invalidateTree(qc),
  });
}

export function useRemoveCompanyCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.removeCompanyCity(id),
    onSuccess: () => invalidateTree(qc),
  });
}

export function useAddCompanyPincodes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { cityId: string; dto: AddPincodesDto }) =>
      svc.addCompanyPincodes(vars.cityId, vars.dto),
    onSuccess: () => invalidateTree(qc),
  });
}

export function useAddCompanyPincodeRange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { cityId: string; dto: AddPincodeRangeDto }) =>
      svc.addCompanyPincodeRange(vars.cityId, vars.dto),
    onSuccess: () => invalidateTree(qc),
  });
}

export function useRemoveCompanyPincode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.removeCompanyPincode(id),
    onSuccess: () => invalidateTree(qc),
  });
}
