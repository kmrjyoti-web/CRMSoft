import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/manufacturers.service";
import type { CreateManufacturerDto, LinkOrganizationDto, LinkContactDto, ManufacturerFilters } from "../types/manufacturers.types";

const KEY = "manufacturers";

export function useManufacturers(params?: ManufacturerFilters) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => svc.listManufacturers(params) });
}

export function useManufacturer(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => svc.getManufacturer(id), enabled: !!id });
}

export function useManufacturerOrganizations(id: string) {
  return useQuery({ queryKey: [KEY, id, "orgs"], queryFn: () => svc.getManufacturerOrganizations(id), enabled: !!id });
}

export function useManufacturerContacts(id: string) {
  return useQuery({ queryKey: [KEY, id, "contacts"], queryFn: () => svc.getManufacturerContacts(id), enabled: !!id });
}

export function useCreateManufacturer() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (dto: CreateManufacturerDto) => svc.createManufacturer(dto), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) });
}

export function useUpdateManufacturer() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (vars: { id: string; dto: Partial<CreateManufacturerDto> }) => svc.updateManufacturer(vars.id, vars.dto), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) });
}

export function useDeleteManufacturer() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => svc.deleteManufacturer(id), onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }) });
}

export function useLinkManufacturerOrganization() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (vars: { id: string; dto: LinkOrganizationDto }) => svc.linkOrganization(vars.id, vars.dto), onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }) });
}

export function useUnlinkManufacturerOrganization() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (vars: { id: string; orgId: string }) => svc.unlinkOrganization(vars.id, vars.orgId), onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }) });
}

export function useLinkManufacturerContact() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (vars: { id: string; dto: LinkContactDto }) => svc.linkContact(vars.id, vars.dto), onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }) });
}

export function useUnlinkManufacturerContact() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (vars: { id: string; contactId: string }) => svc.unlinkContact(vars.id, vars.contactId), onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: [KEY, vars.id] }) });
}
