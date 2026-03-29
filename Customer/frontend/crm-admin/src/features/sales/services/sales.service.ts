import { api } from '@/services/api-client';
import type {
  CreateSaleOrderPayload,
  CreateDeliveryChallanPayload,
  CreateSaleReturnPayload,
  CreateDebitNotePayload,
} from '../types/sales.types';

const BASE = '/api/v1/sales';

export const salesService = {
  // Sale Orders
  listOrders: (params?: Record<string, string>) =>
    api.get<any>(`${BASE}/orders`, { params }).then((r) => r.data),
  getOrder: (id: string) =>
    api.get<any>(`${BASE}/orders/${id}`).then((r) => r.data),
  createOrder: (data: CreateSaleOrderPayload) =>
    api.post<any>(`${BASE}/orders`, data).then((r) => r.data),
  updateOrder: (id: string, data: Record<string, unknown>) =>
    api.patch<any>(`${BASE}/orders/${id}`, data).then((r) => r.data),
  approveOrder: (id: string) =>
    api.post<any>(`${BASE}/orders/${id}/approve`).then((r) => r.data),
  rejectOrder: (id: string, reason?: string) =>
    api.post<any>(`${BASE}/orders/${id}/reject`, { reason }).then((r) => r.data),
  convertToInvoice: (id: string) =>
    api.post<any>(`${BASE}/orders/${id}/convert-invoice`).then((r) => r.data),
  cancelOrder: (id: string) =>
    api.post<any>(`${BASE}/orders/${id}/cancel`).then((r) => r.data),

  // Delivery Challans
  listChallans: (params?: Record<string, string>) =>
    api.get<any>(`${BASE}/delivery-challans`, { params }).then((r) => r.data),
  getChallan: (id: string) =>
    api.get<any>(`${BASE}/delivery-challans/${id}`).then((r) => r.data),
  createChallan: (data: CreateDeliveryChallanPayload) =>
    api.post<any>(`${BASE}/delivery-challans`, data).then((r) => r.data),
  dispatchChallan: (id: string) =>
    api.post<any>(`${BASE}/delivery-challans/${id}/dispatch`).then((r) => r.data),
  deliverChallan: (id: string) =>
    api.post<any>(`${BASE}/delivery-challans/${id}/deliver`).then((r) => r.data),
  cancelChallan: (id: string) =>
    api.post<any>(`${BASE}/delivery-challans/${id}/cancel`).then((r) => r.data),

  // Sale Returns
  listReturns: (params?: Record<string, string>) =>
    api.get<any>(`${BASE}/returns`, { params }).then((r) => r.data),
  getReturn: (id: string) =>
    api.get<any>(`${BASE}/returns/${id}`).then((r) => r.data),
  createReturn: (data: CreateSaleReturnPayload) =>
    api.post<any>(`${BASE}/returns`, data).then((r) => r.data),
  inspectReturn: (id: string, inspections: Record<string, unknown>[]) =>
    api.post<any>(`${BASE}/returns/${id}/inspect`, { inspections }).then((r) => r.data),
  acceptReturn: (id: string) =>
    api.post<any>(`${BASE}/returns/${id}/accept`).then((r) => r.data),
  rejectReturn: (id: string) =>
    api.post<any>(`${BASE}/returns/${id}/reject`).then((r) => r.data),

  // Credit Notes
  listCreditNotes: () =>
    api.get<any>(`${BASE}/credit-notes`).then((r) => r.data),
  getCreditNote: (id: string) =>
    api.get<any>(`${BASE}/credit-notes/${id}`).then((r) => r.data),
  createCreditNote: (data: Record<string, unknown>) =>
    api.post<any>(`${BASE}/credit-notes`, data).then((r) => r.data),
  issueCreditNote: (id: string) =>
    api.post<any>(`${BASE}/credit-notes/${id}/issue`).then((r) => r.data),
  adjustCreditNote: (id: string, data: Record<string, unknown>) =>
    api.post<any>(`${BASE}/credit-notes/${id}/adjust`, data).then((r) => r.data),

  // Debit Notes
  listDebitNotes: () =>
    api.get<any>(`${BASE}/debit-notes`).then((r) => r.data),
  getDebitNote: (id: string) =>
    api.get<any>(`${BASE}/debit-notes/${id}`).then((r) => r.data),
  createDebitNote: (data: CreateDebitNotePayload) =>
    api.post<any>(`${BASE}/debit-notes`, data).then((r) => r.data),
  issueDebitNote: (id: string) =>
    api.post<any>(`${BASE}/debit-notes/${id}/issue`).then((r) => r.data),
  adjustDebitNote: (id: string, data: Record<string, unknown>) =>
    api.post<any>(`${BASE}/debit-notes/${id}/adjust`, data).then((r) => r.data),
};
