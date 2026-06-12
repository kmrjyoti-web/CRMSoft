import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  invoiceService,
  paymentService,
  creditNoteService,
  refundService,
} from "../services/finance.service";

import type {
  InvoiceCreateData,
  InvoiceUpdateData,
  GenerateInvoiceData,
  CancelInvoiceData,
  RecordPaymentData,
  CreateCreditNoteData,
  ApplyCreditNoteData,
  CreateRefundData,
  InvoiceListParams,
  PaymentListParams,
} from "../types/finance.types";

const INVOICES_KEY = "invoices";
const PAYMENTS_KEY = "payments";

// ---------------------------------------------------------------------------
// Invoice hooks
// ---------------------------------------------------------------------------

export function useInvoicesList(params?: InvoiceListParams) {
  return useQuery({
    queryKey: [INVOICES_KEY, params],
    queryFn: () => invoiceService.getAll(params).then((r) => r.data),
  });
}

export function useInvoiceDetail(id: string) {
  return useQuery({
    queryKey: [INVOICES_KEY, id],
    queryFn: () => invoiceService.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InvoiceCreateData) =>
      invoiceService.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InvoiceUpdateData }) =>
      invoiceService.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}

export function useGenerateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateInvoiceData) =>
      invoiceService.generate(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}

export function useSendInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoiceService.send(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}

export function useCancelInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelInvoiceData }) =>
      invoiceService.cancel(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}

// ---------------------------------------------------------------------------
// Payment hooks
// ---------------------------------------------------------------------------

export function usePaymentsList(params?: PaymentListParams) {
  return useQuery({
    queryKey: [PAYMENTS_KEY, params],
    queryFn: () => paymentService.getAll(params).then((r) => r.data),
  });
}

export function usePaymentDetail(id: string) {
  return useQuery({
    queryKey: [PAYMENTS_KEY, id],
    queryFn: () => paymentService.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RecordPaymentData) =>
      paymentService.record(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
      qc.invalidateQueries({ queryKey: [INVOICES_KEY] });
    },
  });
}

// ---------------------------------------------------------------------------
// Credit Note hooks
// ---------------------------------------------------------------------------

export function useCreateCreditNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCreditNoteData) =>
      creditNoteService.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}

export function useIssueCreditNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => creditNoteService.issue(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}

export function useApplyCreditNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApplyCreditNoteData }) =>
      creditNoteService.apply(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}

export function useCancelCreditNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => creditNoteService.cancel(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}

// ---------------------------------------------------------------------------
// Refund hooks
// ---------------------------------------------------------------------------

export function useCreateRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRefundData) =>
      refundService.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
      qc.invalidateQueries({ queryKey: [INVOICES_KEY] });
    },
  });
}
