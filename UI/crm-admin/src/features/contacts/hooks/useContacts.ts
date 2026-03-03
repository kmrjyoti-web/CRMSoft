import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { contactsService } from "../services/contacts.service";

import type {
  ContactListParams,
  ContactCreateData,
  ContactUpdateData,
} from "../types/contacts.types";

const KEY = "contacts";

export function useContactsList(params?: ContactListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => contactsService.getAll(params),
  });
}

export function useContactDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => contactsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ContactCreateData) => contactsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContactUpdateData }) =>
      contactsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeactivateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactsService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useReactivateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactsService.reactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSoftDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactsService.softDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["recycle-bin"] });
    },
  });
}

export function useRestoreContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactsService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["recycle-bin"] });
    },
  });
}

export function usePermanentDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactsService.permanentDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recycle-bin"] }),
  });
}
