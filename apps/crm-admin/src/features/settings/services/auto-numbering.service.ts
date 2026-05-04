import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  AutoNumberSequence,
  UpdateAutoNumberData,
  ResetSequenceData,
} from "../types/auto-numbering.types";

const BASE_URL = "/api/v1/settings/auto-numbering";

export const autoNumberingService = {
  getAll: () =>
    apiClient
      .get<ApiResponse<AutoNumberSequence[]>>(BASE_URL)
      .then((r) => r.data),

  getOne: (entity: string) =>
    apiClient
      .get<ApiResponse<AutoNumberSequence>>(`${BASE_URL}/${entity}`)
      .then((r) => r.data),

  update: (entity: string, payload: UpdateAutoNumberData) =>
    apiClient
      .put<ApiResponse<AutoNumberSequence>>(`${BASE_URL}/${entity}`, payload)
      .then((r) => r.data),

  preview: (entity: string) =>
    apiClient
      .get<ApiResponse<{ number: string }>>(`${BASE_URL}/${entity}/preview`)
      .then((r) => r.data),

  reset: (entity: string, payload?: ResetSequenceData) =>
    apiClient
      .post<ApiResponse<void>>(`${BASE_URL}/${entity}/reset`, payload ?? {})
      .then((r) => r.data),
};
