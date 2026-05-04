import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/help-system.service";
import type {
  CreateArticleDto,
  UpdateArticleDto,
  HelpArticleFilters,
} from "../types/help-system.types";

const KEYS = {
  articles: "help-articles",
  contextual: "help-contextual",
};

export function useHelpArticles(filters?: HelpArticleFilters) {
  return useQuery({ queryKey: [KEYS.articles, filters], queryFn: () => svc.listArticles(filters) });
}

export function useContextualHelp(params: { screenCode?: string; fieldCode?: string }) {
  return useQuery({
    queryKey: [KEYS.contextual, params],
    queryFn: () => svc.getContextualHelp(params),
    enabled: !!(params.screenCode || params.fieldCode),
  });
}

export function useHelpArticle(code: string) {
  return useQuery({ queryKey: [KEYS.articles, code], queryFn: () => svc.getArticleByCode(code), enabled: !!code });
}

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateArticleDto) => svc.createArticle(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.articles] }),
  });
}

export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateArticleDto }) => svc.updateArticle(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.articles] }),
  });
}

export function useMarkHelpful() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.markHelpful(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.articles] }),
  });
}

export function useMarkNotHelpful() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.markNotHelpful(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.articles] }),
  });
}

export function useSeedArticles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => svc.seedArticles(),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.articles] }),
  });
}
