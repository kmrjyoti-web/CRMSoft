import apiClient from "@/services/api-client";

import type {
  InvoiceListItem,
  InvoiceDetail,
  InvoiceCreateData,
  InvoiceUpdateData,
  GenerateInvoiceData,
  CancelInvoiceData,
  PaymentListItem,
  PaymentDetail as PaymentDetailType,
  RecordPaymentData,
  CreditNote,
  CreateCreditNoteData,
  ApplyCreditNoteData,
  CreateRefundData,
  Refund,
  InvoiceListParams,
  PaymentListParams,
} from "../types/finance.types";

import type { ApiResponse } from "@/types/api-response";

// ---------------------------------------------------------------------------
// Invoice Service
// ---------------------------------------------------------------------------

export const invoiceService = {
  getAll(params?: InvoiceListParams) {
    return apiClient.get<ApiResponse<InvoiceListItem[]>>("/invoices", { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<InvoiceDetail>>(`/invoices/${id}`);
  },

  create(data: InvoiceCreateData) {
    return apiClient.post<ApiResponse<InvoiceDetail>>("/invoices", data);
  },

  update(id: string, data: InvoiceUpdateData) {
    return apiClient.put<ApiResponse<InvoiceDetail>>(`/invoices/${id}`, data);
  },

  generate(data: GenerateInvoiceData) {
    return apiClient.post<ApiResponse<InvoiceDetail>>("/invoices/generate", data);
  },

  send(id: string) {
    return apiClient.post<ApiResponse<InvoiceDetail>>(`/invoices/${id}/send`);
  },

  cancel(id: string, data: CancelInvoiceData) {
    return apiClient.post<ApiResponse<void>>(`/invoices/${id}/cancel`, data);
  },
};

// ---------------------------------------------------------------------------
// Payment Service
// ---------------------------------------------------------------------------

export const paymentService = {
  getAll(params?: PaymentListParams) {
    return apiClient.get<ApiResponse<PaymentListItem[]>>("/payments", { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<PaymentDetailType>>(`/payments/${id}`);
  },

  record(data: RecordPaymentData) {
    return apiClient.post<ApiResponse<PaymentDetailType>>("/payments/record", data);
  },
};

// ---------------------------------------------------------------------------
// Credit Note Service
// ---------------------------------------------------------------------------

export const creditNoteService = {
  getAll(params?: { invoiceId?: string; status?: string; page?: number; limit?: number }) {
    return apiClient.get<ApiResponse<CreditNote[]>>("/credit-notes", { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<CreditNote>>(`/credit-notes/${id}`);
  },

  create(data: CreateCreditNoteData) {
    return apiClient.post<ApiResponse<CreditNote>>("/credit-notes", data);
  },

  issue(id: string) {
    return apiClient.post<ApiResponse<CreditNote>>(`/credit-notes/${id}/issue`);
  },

  apply(id: string, data: ApplyCreditNoteData) {
    return apiClient.post<ApiResponse<CreditNote>>(`/credit-notes/${id}/apply`, data);
  },

  cancel(id: string) {
    return apiClient.post<ApiResponse<void>>(`/credit-notes/${id}/cancel`);
  },
};

// ---------------------------------------------------------------------------
// Refund Service
// ---------------------------------------------------------------------------

export const refundService = {
  create(data: CreateRefundData) {
    return apiClient.post<ApiResponse<Refund>>("/refunds", data);
  },
};
