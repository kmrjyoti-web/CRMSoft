import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

import type {
  NotionConfig,
  NotionDatabase,
  NotionEntry,
  NotionEntryCreate,
  NotionConfigUpdate,
} from "../types/notion.types";

const BASE_URL = "/api/v1/settings/notion";

export const notionService = {
  getConfig: () =>
    apiClient
      .get<ApiResponse<NotionConfig>>(BASE_URL)
      .then((r) => r.data),

  saveConfig: (payload: NotionConfigUpdate) =>
    apiClient
      .put<ApiResponse<NotionConfig>>(BASE_URL, payload)
      .then((r) => r.data),

  testConnection: () =>
    apiClient
      .post<ApiResponse<{ success: boolean; user?: string; error?: string }>>(
        `${BASE_URL}/test`,
      )
      .then((r) => r.data),

  listDatabases: () =>
    apiClient
      .get<ApiResponse<NotionDatabase[]>>(`${BASE_URL}/databases`)
      .then((r) => r.data),

  createEntry: (payload: NotionEntryCreate) =>
    apiClient
      .post<ApiResponse<{ id: string; url: string }>>(
        `${BASE_URL}/entries`,
        payload,
      )
      .then((r) => r.data),

  listEntries: () =>
    apiClient
      .get<ApiResponse<NotionEntry[]>>(`${BASE_URL}/entries`)
      .then((r) => r.data),
};
