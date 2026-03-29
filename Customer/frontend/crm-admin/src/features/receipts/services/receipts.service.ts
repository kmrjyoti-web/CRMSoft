import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type { Receipt, ReceiptFilters } from "../types/receipts.types";

const BASE = "/api/v1/receipts";

export function listReceipts(params?: ReceiptFilters) {
  return apiClient.get<ApiResponse<Receipt[]>>(BASE, { params }).then((r) => r.data);
}

export function getReceipt(id: string) {
  return apiClient.get<ApiResponse<Receipt>>(`${BASE}/${id}`).then((r) => r.data);
}

export function getByPayment(paymentId: string) {
  return apiClient.get<ApiResponse<Receipt>>(`${BASE}/payment/${paymentId}`).then((r) => r.data);
}

export function generateReceipt(paymentId: string) {
  return apiClient.post<ApiResponse<Receipt>>(`${BASE}/generate/${paymentId}`).then((r) => r.data);
}
