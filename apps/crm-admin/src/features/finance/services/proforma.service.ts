import apiClient from "@/services/api-client";

import type {
  ProformaListItem,
  ProformaDetail,
  ProformaCreateData,
  ProformaUpdateData,
  GenerateProformaData,
  CancelProformaData,
  ProformaListParams,
} from "../types/proforma.types";

import type { ApiResponse } from "@/types/api-response";

const BASE_URL = "/api/v1/proforma-invoices";

export const proformaService = {
  getAll(params?: ProformaListParams) {
    return apiClient.get<ApiResponse<ProformaListItem[]>>(BASE_URL, { params });
  },

  getById(id: string) {
    return apiClient.get<ApiResponse<ProformaDetail>>(`${BASE_URL}/${id}`);
  },

  create(data: ProformaCreateData) {
    return apiClient.post<ApiResponse<ProformaDetail>>(BASE_URL, data);
  },

  update(id: string, data: ProformaUpdateData) {
    return apiClient.put<ApiResponse<ProformaDetail>>(`${BASE_URL}/${id}`, data);
  },

  generate(data: GenerateProformaData) {
    return apiClient.post<ApiResponse<ProformaDetail>>(`${BASE_URL}/generate`, data);
  },

  send(id: string) {
    return apiClient.post<ApiResponse<ProformaDetail>>(`${BASE_URL}/${id}/send`);
  },

  convertToInvoice(id: string) {
    return apiClient.post<ApiResponse<ProformaDetail>>(`${BASE_URL}/${id}/convert`);
  },

  cancel(id: string, data: CancelProformaData) {
    return apiClient.post<ApiResponse<void>>(`${BASE_URL}/${id}/cancel`, data);
  },
};
