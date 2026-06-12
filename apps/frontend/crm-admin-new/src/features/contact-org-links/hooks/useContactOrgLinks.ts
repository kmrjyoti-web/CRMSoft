import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/contact-org-links.service";
import type { LinkContactOrgDto, UpdateContactOrgDto, ChangeRelationDto } from "../types/contact-org-links.types";

const KEY = "contact-org-links";

export function useContactOrganizations(contactId: string) {
  return useQuery({
    queryKey: [KEY, "by-contact", contactId],
    queryFn: () => svc.getByContact(contactId),
    enabled: !!contactId,
  });
}

export function useOrganizationContacts(organizationId: string) {
  return useQuery({
    queryKey: [KEY, "by-org", organizationId],
    queryFn: () => svc.getByOrganization(organizationId),
    enabled: !!organizationId,
  });
}

export function useLinkContactOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: LinkContactOrgDto) => svc.linkContactOrg(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateContactOrgMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: UpdateContactOrgDto }) => svc.updateMapping(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSetPrimaryContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.setPrimary(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useChangeRelation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; dto: ChangeRelationDto }) => svc.changeRelation(vars.id, vars.dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUnlinkContactOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.unlinkContactOrg(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
