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

const INVOICES_URL = "/api/v1/invoices";
const PAYMENTS_URL = "/api/v1/payments";
const CREDIT_NOTES_URL = "/api/v1/credit-notes";
const REFUNDS_URL = "/api/v1/refunds";

export const invoiceService = {
  getAll(params?: InvoiceListParams) {
    return apiClient.get<ApiResponse<InvoiceListItem[]>>(INVOICES_URL, { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<InvoiceDetail>>(`${INVOICES_URL}/${id}`);
  },

  create(data: InvoiceCreateData) {
    return apiClient.post<ApiResponse<InvoiceDetail>>(INVOICES_URL, data);
  },

  update(id: string, data: InvoiceUpdateData) {
    return apiClient.put<ApiResponse<InvoiceDetail>>(`${INVOICES_URL}/${id}`, data);
  },

  generate(data: GenerateInvoiceData) {
    return apiClient.post<ApiResponse<InvoiceDetail>>(`${INVOICES_URL}/generate`, data);
  },

  send(id: string) {
    return apiClient.post<ApiResponse<InvoiceDetail>>(`${INVOICES_URL}/${id}/send`);
  },

  cancel(id: string, data: CancelInvoiceData) {
    return apiClient.post<ApiResponse<void>>(`${INVOICES_URL}/${id}/cancel`, data);
  },
};

// ---------------------------------------------------------------------------
// Payment Service
// ---------------------------------------------------------------------------

export const paymentService = {
  getAll(params?: PaymentListParams) {
    return apiClient.get<ApiResponse<PaymentListItem[]>>(PAYMENTS_URL, { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<PaymentDetailType>>(`${PAYMENTS_URL}/${id}`);
  },

  record(data: RecordPaymentData) {
    return apiClient.post<ApiResponse<PaymentDetailType>>(`${PAYMENTS_URL}/record`, data);
  },
};

// ---------------------------------------------------------------------------
// Credit Note Service
// ---------------------------------------------------------------------------

export const creditNoteService = {
  getAll(params?: { invoiceId?: string; status?: string; page?: number; limit?: number }) {
    return apiClient.get<ApiResponse<CreditNote[]>>(CREDIT_NOTES_URL, { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<CreditNote>>(`${CREDIT_NOTES_URL}/${id}`);
  },

  create(data: CreateCreditNoteData) {
    return apiClient.post<ApiResponse<CreditNote>>(CREDIT_NOTES_URL, data);
  },

  issue(id: string) {
    return apiClient.post<ApiResponse<CreditNote>>(`${CREDIT_NOTES_URL}/${id}/issue`);
  },

  apply(id: string, data: ApplyCreditNoteData) {
    return apiClient.post<ApiResponse<CreditNote>>(`${CREDIT_NOTES_URL}/${id}/apply`, data);
  },

  cancel(id: string) {
    return apiClient.post<ApiResponse<void>>(`${CREDIT_NOTES_URL}/${id}/cancel`);
  },
};

// ---------------------------------------------------------------------------
// Refund Service
// ---------------------------------------------------------------------------

export const refundService = {
  create(data: CreateRefundData) {
    return apiClient.post<ApiResponse<Refund>>(REFUNDS_URL, data);
  },
};
