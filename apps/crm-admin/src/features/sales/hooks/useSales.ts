import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '../services/sales.service';
import type {
  CreateSaleOrderPayload,
  CreateDeliveryChallanPayload,
  CreateSaleReturnPayload,
  CreateDebitNotePayload,
} from '../types/sales.types';

// ── Sale Orders ──────────────────────────────────────────────

export function useSaleOrderList(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['sale-orders', params],
    queryFn: () => salesService.listOrders(params),
  });
}

export function useSaleOrderDetail(id?: string) {
  return useQuery({
    queryKey: ['sale-order', id],
    queryFn: () => salesService.getOrder(id!),
    enabled: !!id,
  });
}

export function useCreateSaleOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSaleOrderPayload) => salesService.createOrder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-orders'] });
    },
  });
}

export function useUpdateSaleOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      salesService.updateOrder(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-orders'] });
      qc.invalidateQueries({ queryKey: ['sale-order'] });
    },
  });
}

export function useApproveSaleOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesService.approveOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-orders'] });
      qc.invalidateQueries({ queryKey: ['sale-order'] });
    },
  });
}

export function useRejectSaleOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      salesService.rejectOrder(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-orders'] });
    },
  });
}

export function useConvertToInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesService.convertToInvoice(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-orders'] });
      qc.invalidateQueries({ queryKey: ['sale-order'] });
    },
  });
}

export function useCancelSaleOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesService.cancelOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-orders'] });
    },
  });
}

// ── Delivery Challans ────────────────────────────────────────

export function useDeliveryChallanList(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['delivery-challans', params],
    queryFn: () => salesService.listChallans(params),
  });
}

export function useDeliveryChallanDetail(id?: string) {
  return useQuery({
    queryKey: ['delivery-challan', id],
    queryFn: () => salesService.getChallan(id!),
    enabled: !!id,
  });
}

export function useCreateDeliveryChallan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeliveryChallanPayload) =>
      salesService.createChallan(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delivery-challans'] });
    },
  });
}

export function useDispatchChallan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesService.dispatchChallan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delivery-challans'] });
      qc.invalidateQueries({ queryKey: ['delivery-challan'] });
    },
  });
}

export function useDeliverChallan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesService.deliverChallan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delivery-challans'] });
    },
  });
}

export function useCancelChallan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesService.cancelChallan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['delivery-challans'] });
    },
  });
}

// ── Sale Returns ─────────────────────────────────────────────

export function useSaleReturnList(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['sale-returns', params],
    queryFn: () => salesService.listReturns(params),
  });
}

export function useSaleReturnDetail(id?: string) {
  return useQuery({
    queryKey: ['sale-return', id],
    queryFn: () => salesService.getReturn(id!),
    enabled: !!id,
  });
}

export function useCreateSaleReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSaleReturnPayload) =>
      salesService.createReturn(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-returns'] });
    },
  });
}

export function useInspectReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, inspections }: { id: string; inspections: any[] }) =>
      salesService.inspectReturn(id, inspections),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-returns'] });
      qc.invalidateQueries({ queryKey: ['sale-return'] });
    },
  });
}

export function useAcceptReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesService.acceptReturn(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-returns'] });
    },
  });
}

export function useRejectReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesService.rejectReturn(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sale-returns'] });
    },
  });
}

// ── Credit Notes ─────────────────────────────────────────────

export function useCreditNoteList() {
  return useQuery({
    queryKey: ['credit-notes'],
    queryFn: () => salesService.listCreditNotes(),
  });
}

export function useCreditNoteDetail(id?: string) {
  return useQuery({
    queryKey: ['credit-note', id],
    queryFn: () => salesService.getCreditNote(id!),
    enabled: !!id,
  });
}

export function useIssueCreditNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesService.issueCreditNote(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit-notes'] });
    },
  });
}

export function useAdjustCreditNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      salesService.adjustCreditNote(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit-notes'] });
    },
  });
}

// ── Debit Notes ──────────────────────────────────────────────

export function useDebitNoteList() {
  return useQuery({
    queryKey: ['debit-notes'],
    queryFn: () => salesService.listDebitNotes(),
  });
}

export function useDebitNoteDetail(id?: string) {
  return useQuery({
    queryKey: ['debit-note', id],
    queryFn: () => salesService.getDebitNote(id!),
    enabled: !!id,
  });
}

export function useCreateDebitNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDebitNotePayload) =>
      salesService.createDebitNote(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debit-notes'] });
    },
  });
}

export function useIssueDebitNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesService.issueDebitNote(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debit-notes'] });
    },
  });
}

export function useAdjustDebitNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      salesService.adjustDebitNote(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debit-notes'] });
    },
  });
}
