import apiClient from '@/services/api-client';
import type { ApiResponse } from '@/types/api-response';

const BASE = '/api/v1/ai';

export interface AiGeneratePayload {
  prompt: string;
  context?: string;
  provider?: string;
  model?: string;
}

export interface AiImprovePayload {
  text: string;
  instruction?: string;
  provider?: string;
  model?: string;
}

export interface AiTranslatePayload {
  text: string;
  targetLanguage: string;
  provider?: string;
  model?: string;
}

export interface AiSummarizePayload {
  text: string;
  maxLength?: number;
  provider?: string;
  model?: string;
}

export interface AiTonePayload {
  text: string;
  tone: string;
  provider?: string;
  model?: string;
}

export interface AiResult {
  content: string;
  usage?: { promptTokens: number; outputTokens: number };
}

export const aiService = {
  generate: (data: AiGeneratePayload) =>
    apiClient.post<ApiResponse<AiResult>>(`${BASE}/generate`, data).then((r) => r.data),

  improve: (data: AiImprovePayload) =>
    apiClient.post<ApiResponse<AiResult>>(`${BASE}/improve`, data).then((r) => r.data),

  translate: (data: AiTranslatePayload) =>
    apiClient.post<ApiResponse<AiResult>>(`${BASE}/translate`, data).then((r) => r.data),

  summarize: (data: AiSummarizePayload) =>
    apiClient.post<ApiResponse<AiResult>>(`${BASE}/summarize`, data).then((r) => r.data),

  changeTone: (data: AiTonePayload) =>
    apiClient.post<ApiResponse<AiResult>>(`${BASE}/tone`, data).then((r) => r.data),

  getModels: () =>
    apiClient.get<ApiResponse<any>>(`${BASE}/models`).then((r) => r.data),
};
