"use client";

import { useMemo, useCallback } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { tableConfigService } from "../services/table-config.service";

import { mergeConfig } from "../utils/merge-config";

import type { TableConfigData, ColumnConfig, SaveTableConfigPayload } from "../types/table-config.types";

const KEY = "table-config";

const EMPTY_COLUMNS: ColumnConfig[] = [];

/**
 * Hook to fetch + save table config.
 * Pass `undefined` to disable (no API call).
 */
export function useTableConfig(tableKey: string | undefined) {
  const qc = useQueryClient();
  const enabled = !!tableKey;

  const { data, isLoading } = useQuery({
    queryKey: [KEY, tableKey],
    queryFn: () => tableConfigService.get(tableKey!),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,              // non-critical — don't retry on failure
    enabled,
  });

  const savedConfig = enabled
    ? (data?.data?.config as TableConfigData | null | undefined)
    : undefined;

  const merged = useMemo(
    () => (enabled ? mergeConfig(tableKey!, savedConfig) : null),
    [enabled, tableKey, savedConfig],
  );

  const saveMutation = useMutation({
    mutationFn: (payload: SaveTableConfigPayload) =>
      tableConfigService.upsert(tableKey!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, tableKey] }),
  });

  const resetMutation = useMutation({
    mutationFn: () => tableConfigService.reset(tableKey!),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, tableKey] }),
  });

  const columns: ColumnConfig[] = merged?.columns ?? EMPTY_COLUMNS;
  const visibleColumns = useMemo(
    () =>
      columns
        .filter((c) => c.visible)
        .sort((a, b) => a.order - b.order)
        .map((c) => ({ id: c.id, label: c.label ?? c.id, visible: true })),
    [columns],
  );

  const saveConfig = useCallback(
    (config: TableConfigData, applyToAll?: boolean) =>
      saveMutation.mutateAsync({ config, applyToAll }),
    [saveMutation],
  );

  const resetToDefault = useCallback(
    () => resetMutation.mutateAsync(),
    [resetMutation],
  );

  return {
    columns,
    visibleColumns,
    density: merged?.density,
    defaultViewMode: merged?.defaultViewMode,
    pageSize: merged?.pageSize,
    showRowActions: merged?.showRowActions ?? true,
    filterVisibility: merged?.filterVisibility,
    isLoading: enabled ? isLoading : false,
    isSaving: saveMutation.isPending,
    saveConfig,
    resetToDefault,
  };
}
