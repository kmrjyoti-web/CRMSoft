import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { organizationsService } from "../services/organizations.service";

import type {
  OrganizationListParams,
  OrganizationCreateData,
  OrganizationUpdateData,
} from "../types/organizations.types";

const KEY = "organizations";

export function useOrganizationsList(params?: OrganizationListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => organizationsService.getAll(params),
  });
}

export function useOrganizationDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => organizationsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OrganizationCreateData) =>
      organizationsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrganizationUpdateData }) =>
      organizationsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeactivateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationsService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useReactivateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationsService.reactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSoftDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationsService.softDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["recycle-bin"] });
    },
  });
}

export function useRestoreOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationsService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["recycle-bin"] });
    },
  });
}

export function usePermanentDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationsService.permanentDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recycle-bin"] }),
  });
}
