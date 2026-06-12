import apiClient from "@/services/api-client";

import type {
  QuotationListItem,
  QuotationDetail,
  QuotationCreateData,
  QuotationUpdateData,
  QuotationListParams,
  LineItemCreateData,
  LineItemUpdateData,
  SendQuotationData,
  AcceptQuotationData,
  RejectQuotationData,
  LineItem,
} from "../types/quotations.types";

import type { ApiResponse } from "@/types/api-response";

const BASE_URL = "/api/v1/quotations";

export const quotationsService = {
  getAll(params?: QuotationListParams) {
    return apiClient.get<ApiResponse<QuotationListItem[]>>(BASE_URL, { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<QuotationDetail>>(`${BASE_URL}/${id}`);
  },

  create(data: QuotationCreateData) {
    return apiClient.post<ApiResponse<QuotationDetail>>(BASE_URL, data);
  },

  update(id: string, data: QuotationUpdateData) {
    return apiClient.put<ApiResponse<QuotationDetail>>(`${BASE_URL}/${id}`, data);
  },

  cancel(id: string) {
    return apiClient.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
  },

  addLineItem(quotationId: string, data: LineItemCreateData) {
    return apiClient.post<ApiResponse<LineItem>>(`${BASE_URL}/${quotationId}/items`, data);
  },

  updateLineItem(quotationId: string, itemId: string, data: LineItemUpdateData) {
    return apiClient.put<ApiResponse<LineItem>>(`${BASE_URL}/${quotationId}/items/${itemId}`, data);
  },

  removeLineItem(quotationId: string, itemId: string) {
    return apiClient.delete<ApiResponse<void>>(`${BASE_URL}/${quotationId}/items/${itemId}`);
  },

  recalculate(id: string) {
    return apiClient.post<ApiResponse<QuotationDetail>>(`${BASE_URL}/${id}/recalculate`);
  },

  send(id: string, data: SendQuotationData) {
    return apiClient.post<ApiResponse<QuotationDetail>>(`${BASE_URL}/${id}/send`, data);
  },

  accept(id: string, data: AcceptQuotationData) {
    return apiClient.post<ApiResponse<QuotationDetail>>(`${BASE_URL}/${id}/accept`, data);
  },

  reject(id: string, data: RejectQuotationData) {
    return apiClient.post<ApiResponse<QuotationDetail>>(`${BASE_URL}/${id}/reject`, data);
  },

  revise(id: string) {
    return apiClient.post<ApiResponse<QuotationDetail>>(`${BASE_URL}/${id}/revise`);
  },

  clone(id: string) {
    return apiClient.post<ApiResponse<QuotationDetail>>(`${BASE_URL}/${id}/clone`);
  },
};
