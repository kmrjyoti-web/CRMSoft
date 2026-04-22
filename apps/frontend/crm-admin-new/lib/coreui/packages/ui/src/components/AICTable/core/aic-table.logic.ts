/**
 * AICTable state logic and pure helper functions.
 * Framework-agnostic — no React/Angular imports.
 *
 * Source: Angular table-config.model.ts — exact port.
 */

import type {
  TableConfig,
  TableColumn,
  TableState,
  Density,
  DensitySetting,
  SortDirection,
  ActiveFilter,
  FooterColumn,
} from "./aic-table.types";

// ── Default State ───────────────────────────
export function createDefaultTableState(config: TableConfig): TableState {
  const visibleCols = config.columns
    .filter((c) => c.visible !== false)
    .sort((a, b) => a.index - b.index)
    .map((c) => c.code);

  return {
    viewMode: "table",
    currentPage: 1,
    pageSize: config.config.defaultRows,
    sortColumn: null,
    sortDirection: "asc",
    globalFilterTerm: "",
    advancedFilters: {},
    visibleColumnCodes: visibleCols,
  };
}

// ── Column Helpers ──────────────────────────
export function getVisibleColumns(
  columns: TableColumn[],
  visibleCodes: string[]
): TableColumn[] {
  return visibleCodes
    .map((code) => columns.find((c) => c.code === code))
    .filter((c): c is TableColumn => c !== undefined);
}

export function getChoosableColumns(columns: TableColumn[]): TableColumn[] {
  return columns.filter((c) => c.showOnColumnChooser !== false);
}

// ── Sort Helpers ────────────────────────────
export function toggleSortDirection(current: SortDirection): SortDirection {
  return current === "asc" ? "desc" : "asc";
}

export function sortData<T extends Record<string, unknown>>(
  data: T[],
  column: string | null,
  direction: SortDirection
): T[] {
  if (!column) return data;
  const sorted = [...data].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === "string" && typeof bVal === "string") {
      return aVal.localeCompare(bVal);
    }
    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
  });
  return direction === "desc" ? sorted.reverse() : sorted;
}

// ── Filter Helpers ──────────────────────────
export function filterDataByGlobalTerm<T extends Record<string, unknown>>(
  data: T[],
  term: string,
  searchFields?: string[]
): T[] {
  if (!term.trim()) return data;
  const lower = term.toLowerCase();
  return data.filter((row) => {
    const fields = searchFields ?? Object.keys(row);
    return fields.some((key) => {
      const val = row[key];
      return val != null && String(val).toLowerCase().includes(lower);
    });
  });
}

export function hasActiveFilters(
  filters: Record<string, ActiveFilter>
): boolean {
  return Object.keys(filters).length > 0;
}

// ── Pagination Helpers ──────────────────────
export function getTotalPages(totalRecords: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalRecords / pageSize));
}

export function paginateData<T>(
  data: T[],
  page: number,
  pageSize: number
): T[] {
  const start = (page - 1) * pageSize;
  return data.slice(start, start + pageSize);
}

export function getPageRange(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): number[] {
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
}

// ── Density Helpers ─────────────────────────
export function getDensitySetting(
  config: TableConfig,
  density: Density
): DensitySetting {
  const found = config.config.sizerConfig.densities.find(
    (d) => d.name === density
  );
  return found ?? { name: density, cssClass: "", rowHeight: 40 };
}

export function getDensityIcon(density: Density): string {
  switch (density) {
    case "comfortable":
      return "pi-align-justify";
    case "compact":
      return "pi-bars";
    case "dense":
      return "pi-th-large";
    default:
      return "pi-bars";
  }
}

// ── Footer Aggregation ──────────────────────
export function calculateFooterValue(
  data: Record<string, unknown>[],
  column: FooterColumn
): string {
  const values = data
    .map((row) => Number(row[column.code]))
    .filter((v) => !isNaN(v));

  switch (column.aggregation) {
    case "sum":
      return values.reduce((a, b) => a + b, 0).toLocaleString();
    case "avg": {
      const sum = values.reduce((a, b) => a + b, 0);
      return values.length > 0
        ? (sum / values.length).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })
        : "0";
    }
    case "count":
      return values.length.toLocaleString();
    default:
      return "";
  }
}

// ── Mask Helpers ────────────────────────────
export function applyTableMask(
  value: string,
  config: { visibleStart?: number; visibleEnd?: number; maskChar?: string }
): string {
  const char = config.maskChar ?? "*";
  const start = config.visibleStart ?? 0;
  const end = config.visibleEnd ?? 0;

  if (value.length <= start + end) return value;

  const prefix = value.slice(0, start);
  const suffix = value.slice(value.length - end);
  const middle = char.repeat(value.length - start - end);
  return prefix + middle + suffix;
}

// ── Strategy Descriptions ───────────────────
export const DATA_STRATEGY_DESCRIPTIONS: Record<string, string> = {
  ONLINE_FIRST: "Fetches data from the server first, falls back to cache.",
  OFFLINE_FIRST: "Uses cached data first, syncs with server in background.",
};
