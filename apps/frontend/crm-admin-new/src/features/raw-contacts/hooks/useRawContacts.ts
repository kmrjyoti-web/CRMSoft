import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { rawContactsService } from "../services/raw-contacts.service";

import type {
  RawContactListParams,
  RawContactCreateData,
  RawContactUpdateData,
  VerifyRawContactData,
  RejectRawContactData,
} from "../types/raw-contacts.types";

const KEY = "raw-contacts";

export function useRawContactsList(params?: RawContactListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => rawContactsService.getAll(params),
  });
}

export function useRawContactDetail(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => rawContactsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateRawContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RawContactCreateData) => rawContactsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateRawContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RawContactUpdateData }) =>
      rawContactsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useVerifyRawContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: VerifyRawContactData }) =>
      rawContactsService.verify(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useRejectRawContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: RejectRawContactData }) =>
      rawContactsService.reject(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useMarkDuplicate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rawContactsService.markDuplicate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useReopenRawContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rawContactsService.reopen(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeactivateRawContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rawContactsService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useReactivateRawContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rawContactsService.reactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useSoftDeleteRawContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rawContactsService.softDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["recycle-bin"] });
    },
  });
}

export function useRestoreRawContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rawContactsService.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["recycle-bin"] });
    },
  });
}

export function usePermanentDeleteRawContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rawContactsService.permanentDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recycle-bin"] }),
  });
}
