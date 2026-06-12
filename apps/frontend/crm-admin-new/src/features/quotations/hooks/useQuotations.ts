import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { quotationsService } from "../services/quotations.service";
import type {
  QuotationCreateData,
  QuotationUpdateData,
  QuotationListParams,
  LineItemCreateData,
  LineItemUpdateData,
  SendQuotationData,
  AcceptQuotationData,
  RejectQuotationData,
} from "../types/quotations.types";

const QUERY_KEY = "quotations";

export function useQuotationsList(params?: QuotationListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => quotationsService.getAll(params).then((r) => r.data),
  });
}

export function useQuotationDetail(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => quotationsService.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: QuotationCreateData) => quotationsService.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: QuotationUpdateData }) =>
      quotationsService.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useCancelQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quotationsService.cancel(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useAddLineItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quotationId, data }: { quotationId: string; data: LineItemCreateData }) =>
      quotationsService.addLineItem(quotationId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateLineItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quotationId, itemId, data }: { quotationId: string; itemId: string; data: LineItemUpdateData }) =>
      quotationsService.updateLineItem(quotationId, itemId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useRemoveLineItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quotationId, itemId }: { quotationId: string; itemId: string }) =>
      quotationsService.removeLineItem(quotationId, itemId).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useRecalculate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quotationsService.recalculate(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useSendQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SendQuotationData }) =>
      quotationsService.send(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useAcceptQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AcceptQuotationData }) =>
      quotationsService.accept(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useRejectQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectQuotationData }) =>
      quotationsService.reject(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useReviseQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quotationsService.revise(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useCloneQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quotationsService.clone(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
