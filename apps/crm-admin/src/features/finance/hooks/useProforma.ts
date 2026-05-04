import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { proformaService } from "../services/proforma.service";

import type {
  ProformaCreateData,
  ProformaUpdateData,
  GenerateProformaData,
  CancelProformaData,
  ProformaListParams,
} from "../types/proforma.types";

const PROFORMAS_KEY = "proforma-invoices";
const INVOICES_KEY = "invoices";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useProformaList(params?: ProformaListParams) {
  return useQuery({
    queryKey: [PROFORMAS_KEY, params],
    queryFn: () => proformaService.getAll(params).then((r) => r.data),
  });
}

export function useProformaDetail(id: string) {
  return useQuery({
    queryKey: [PROFORMAS_KEY, id],
    queryFn: () => proformaService.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateProforma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProformaCreateData) =>
      proformaService.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROFORMAS_KEY] }),
  });
}

export function useUpdateProforma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProformaUpdateData }) =>
      proformaService.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROFORMAS_KEY] }),
  });
}

export function useGenerateProforma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateProformaData) =>
      proformaService.generate(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROFORMAS_KEY] }),
  });
}

export function useSendProforma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      proformaService.send(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROFORMAS_KEY] }),
  });
}

export function useConvertToInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      proformaService.convertToInvoice(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROFORMAS_KEY] });
      qc.invalidateQueries({ queryKey: [INVOICES_KEY] });
    },
  });
}

export function useCancelProforma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelProformaData }) =>
      proformaService.cancel(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROFORMAS_KEY] }),
  });
}
