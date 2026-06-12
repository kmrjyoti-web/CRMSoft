import type { ColumnConfig, TableConfigData } from "../types/table-config.types";
import { getDefaultColumns } from "./column-registry";

/**
 * Merge saved config with system defaults.
 * - New columns from system defaults are appended (visible: false)
 * - Columns removed from system defaults are dropped
 * - Saved label overrides, order, visibility, width, pinned are preserved
 */
export function mergeConfig(
  tableKey: string,
  saved: TableConfigData | null | undefined,
): TableConfigData {
  const systemDefaults = getDefaultColumns(tableKey);

  if (!saved || !saved.columns?.length) {
    return {
      columns: systemDefaults,
      density: saved?.density ?? "compact",
      defaultViewMode: saved?.defaultViewMode ?? "table",
      pageSize: saved?.pageSize,
      showRowActions: saved?.showRowActions ?? true,
      filterVisibility: saved?.filterVisibility,
    };
  }

  const savedMap = new Map(saved.columns.map((c) => [c.id, c]));
  const systemIds = new Set(systemDefaults.map((c) => c.id));

  // Start with saved columns that still exist in system defaults
  const merged: ColumnConfig[] = saved.columns
    .filter((c) => systemIds.has(c.id))
    .map((c) => ({
      ...c,
      // Keep system default label if user hasn't overridden
      label: c.label ?? systemDefaults.find((d) => d.id === c.id)?.label,
    }));

  // Append new system columns that aren't in saved config
  const maxOrder = merged.reduce((max, c) => Math.max(max, c.order), -1);
  let nextOrder = maxOrder + 1;

  for (const sysCol of systemDefaults) {
    if (!savedMap.has(sysCol.id)) {
      merged.push({ ...sysCol, visible: false, order: nextOrder++ });
    }
  }

  return {
    columns: merged.sort((a, b) => a.order - b.order),
    density: saved.density ?? "compact",
    defaultViewMode: saved.defaultViewMode ?? "table",
    pageSize: saved.pageSize,
    showRowActions: saved.showRowActions ?? true,
    filterVisibility: saved.filterVisibility,
  };
}
