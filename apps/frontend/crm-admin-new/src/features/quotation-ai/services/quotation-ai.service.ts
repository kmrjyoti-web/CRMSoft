import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type { WinPrediction, AIGeneratedQuotation, AISuggestion, AIQuestion, PredictWinDto, GenerateQuotationDto, GetSuggestionsDto } from "../types/quotation-ai.types";

const BASE = "/api/v1/quotation-ai";

export function predictWin(dto: PredictWinDto) {
  return apiClient.post<ApiResponse<WinPrediction>>(`${BASE}/predict`, dto).then((r) => r.data);
}

export function generateQuotation(dto: GenerateQuotationDto) {
  return apiClient.post<ApiResponse<AIGeneratedQuotation>>(`${BASE}/generate`, dto).then((r) => r.data);
}

export function getQuestions(leadId: string) {
  return apiClient.get<ApiResponse<AIQuestion[]>>(`${BASE}/questions/${leadId}`).then((r) => r.data);
}
