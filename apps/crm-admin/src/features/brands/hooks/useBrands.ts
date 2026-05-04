import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/brands.service";
import type { CreateBrandDto, LinkOrganizationDto, LinkContactDto, BrandFilters } from "../types/brands.types";

const KEY = "brands";

export function useBrands(params?: BrandFilters) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => svc.listBrands(params) });
}

export function useBrand(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => svc.getBrand(id), enabled: !!id });
}

export function useBrandOrganizations(id: string) {
  return useQuery({ queryKey: [KEY, id, "orgs"], queryFn: () => svc.getBrandOrganizations(id), enabled: !!id });
}

export function useBrandContacts(id: string) {
  return useQuery({ queryKey: [KEY, id, "contacts"], queryFn: () => svc.getBrandContacts(id), enabled: !!id });
}

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: CreateBrandDto) => svc.createBrand(dto), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (vars: { id: string; dto: Partial<CreateBrandDto> }) => svc.updateBrand(vars.id, vars.dto), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => svc.deleteBrand(id), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) });
}

export function useLinkBrandOrganization() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (vars: { id: string; dto: LinkOrganizationDto }) => svc.linkOrganization(vars.id, vars.dto), onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }) });
}

export function useUnlinkBrandOrganization() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (vars: { id: string; orgId: string }) => svc.unlinkOrganization(vars.id, vars.orgId), onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }) });
}

export function useLinkBrandContact() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (vars: { id: string; dto: LinkContactDto }) => svc.linkContact(vars.id, vars.dto), onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }) });
}

export function useUnlinkBrandContact() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (vars: { id: string; contactId: string }) => svc.unlinkContact(vars.id, vars.contactId), onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }) });
}
