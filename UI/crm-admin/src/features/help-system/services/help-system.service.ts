import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type {
  HelpArticle,
  CreateArticleDto,
  UpdateArticleDto,
  HelpArticleFilters,
} from "../types/help-system.types";

const BASE = "/help";

export function listArticles(filters?: HelpArticleFilters) {
  return apiClient.get<ApiResponse<HelpArticle[]>>(`${BASE}/articles`, { params: filters }).then((r) => r.data);
}

export function getContextualHelp(params: { screenCode?: string; fieldCode?: string }) {
  return apiClient.get<ApiResponse<HelpArticle[]>>(`${BASE}/articles/contextual`, { params }).then((r) => r.data);
}

export function getArticleByCode(code: string) {
  return apiClient.get<ApiResponse<HelpArticle>>(`${BASE}/articles/${code}`).then((r) => r.data);
}

export function createArticle(dto: CreateArticleDto) {
  return apiClient.post<ApiResponse<HelpArticle>>(`${BASE}/articles`, dto).then((r) => r.data);
}

export function updateArticle(id: string, dto: UpdateArticleDto) {
  return apiClient.put<ApiResponse<HelpArticle>>(`${BASE}/articles/${id}`, dto).then((r) => r.data);
}

export function markHelpful(id: string) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/articles/${id}/helpful`).then((r) => r.data);
}

export function markNotHelpful(id: string) {
  return apiClient.post<ApiResponse<void>>(`${BASE}/articles/${id}/not-helpful`).then((r) => r.data);
}

export function seedArticles() {
  return apiClient.post<ApiResponse<void>>(`${BASE}/seed`).then((r) => r.data);
}
