import apiClient from "@/services/api-client";
import type { ReligiousModeConfig, PujaStatusResponse } from "../types/puja.types";

const BASE = "/api/v1/settings/religious-mode";

export const pujaService = {
  getConfig: () =>
    apiClient.get<{ data: ReligiousModeConfig }>(BASE).then((r) => r.data.data),

  updateConfig: (patch: Partial<ReligiousModeConfig>) =>
    apiClient.patch<{ data: ReligiousModeConfig }>(BASE, patch).then((r) => r.data.data),

  getStatus: () =>
    apiClient.get<{ data: PujaStatusResponse }>(`${BASE}/status`).then((r) => r.data.data),

  getPresets: () =>
    apiClient.get<{ data: Record<string, any> }>(`${BASE}/presets`).then((r) => r.data.data),

  getAnalytics: () =>
    apiClient.get<{ data: any }>(`${BASE}/analytics`).then((r) => r.data.data),

  logInteraction: (payload: { itemsOffered: string[]; duration: number; date: string }) =>
    apiClient.post(`${BASE}/log`, payload).catch(() => null),
};
