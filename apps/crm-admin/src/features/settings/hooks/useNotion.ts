import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { notionService } from "../services/notion.service";

import type { NotionConfigUpdate, NotionEntryCreate } from "../types/notion.types";

const KEY = "notion";

export function useNotionConfig() {
  return useQuery({
    queryKey: [KEY, "config"],
    queryFn: () => notionService.getConfig(),
  });
}

export function useSaveNotionConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: NotionConfigUpdate) => notionService.saveConfig(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useTestNotionConnection() {
  return useMutation({
    mutationFn: () => notionService.testConnection(),
  });
}

export function useNotionDatabases(enabled: boolean) {
  return useQuery({
    queryKey: [KEY, "databases"],
    queryFn: () => notionService.listDatabases(),
    enabled,
  });
}

export function useNotionEntries(enabled: boolean) {
  return useQuery({
    queryKey: [KEY, "entries"],
    queryFn: () => notionService.listEntries(),
    enabled,
  });
}

export function useCreateNotionEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: NotionEntryCreate) => notionService.createEntry(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "entries"] }),
  });
}
