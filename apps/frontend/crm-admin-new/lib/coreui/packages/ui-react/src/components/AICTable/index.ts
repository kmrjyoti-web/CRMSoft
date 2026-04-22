/**
 * React AICTable component barrel export.
 */

export { AICTable } from "./AICTable";

// Re-export core types for convenience so consumers don't need to
// depend on @coreui/ui directly for common type imports.
export type {
  AICTableProps,
  TableConfig,
  TableColumn,
  ViewMode,
  SortDirection,
  ActiveFilter,
  AICTableDensity,
} from "@coreui/ui";

// ── AICTableFull (10-view variant) ────────────────────
export { AICTableFull } from "./AICTableFull";
export type {
  AICTableFullProps,
  AICTableFullViewMode,
  AICTableFullDensity,
  ColumnDef,
  KanbanSettings,
  TreeSettings,
  ChartSettings,
  BIWidget,
  BISettings,
  ValidationRule,
  ColumnFilterType,
  ColumnFilterDef,
  FilterSectionDef,
  TableFilterConfig,
  FilterValue,
  FilterValues,
} from "./types";
