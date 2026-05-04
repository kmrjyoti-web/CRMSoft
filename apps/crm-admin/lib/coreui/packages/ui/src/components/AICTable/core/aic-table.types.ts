/**
 * AICTable component types.
 * Framework-agnostic — no React, Angular, or other framework imports.
 *
 * Source: Angular table-config.model.ts
 */

// ── View Modes ──────────────────────────────
export type ViewMode = "table" | "card" | "list" | "bi" | "calendar" | "map";
export type DataStrategy = "ONLINE_FIRST" | "OFFLINE_FIRST";
export type PagingMode = "paginator" | "infinite";
export type PaginatorPosition = "top" | "bottom" | "both";
export type Density = "comfortable" | "compact" | "dense";
export type ColumnType =
  | "CHECKBOX"
  | "ACTION"
  | "MOBILE"
  | "EMAIL"
  | "TEXT"
  | "IMAGE"
  | "DATE"
  | "numeric";
export type FilterOperator =
  | "="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "between"
  | "not between"
  | "contains";
export type DateOperator =
  | "age in"
  | "previous"
  | "next"
  | "today"
  | "this week"
  | "this month"
  | "this year"
  | "in the last 30 days";
export type SortDirection = "asc" | "desc";

// ── API Config ──────────────────────────────
export interface TableApiConfig {
  url: string;
  pathTable: string;
  pathExport: string;
  method: string;
  defaultPageSize: number;
}

// ── Export Config ────────────────────────────
export interface ExportOption {
  label: string;
  key: "csv" | "pdf" | "excel";
  icon: string;
}

export interface ExportConfig {
  enabled: boolean;
  options: ExportOption[];
}

// ── Empty State Config ──────────────────────
export interface EmptyStateAction {
  label: string;
  icon?: string;
  key: string;
  class?: string;
}

export interface EmptyStateConfig {
  enabled: boolean;
  imageUrl?: string;
  title: string;
  subtitle: string;
  actions?: EmptyStateAction[];
}

// ── Column Config ───────────────────────────
export interface MaskConfig {
  enabled: boolean;
  unmaskEnabled?: boolean;
  visibleStart?: number;
  visibleEnd?: number;
  maskChar?: string;
}

export interface ImageConfig {
  shape: "circle" | "square";
}

export interface CellTemplateItem {
  code: string;
  tag?: "p" | "small" | "span";
  bold?: boolean;
  columnType?: "TEXT" | "IMAGE";
  imageConfig?: ImageConfig;
}

export interface ColumnFilterConfig {
  defaultOperator: "STARTS_WITH" | "ENDS_WITH" | "EXACT" | "CONTAINS";
}

export interface ValidationConfig {
  required?: boolean;
  requiredErrorColor?: string;
  emptyBackgroundColor?: string;
  minLength?: number;
  maxLength?: number;
  lengthErrorColor?: string;
}

export interface CardViewColumnConfig {
  position: "header" | "body" | "image" | "none";
  footerActions?: {
    showCall?: boolean;
    showEmail?: boolean;
    showWhatsapp?: boolean;
    showDetail?: boolean;
  };
}

export interface TableColumn {
  index: number;
  name: string;
  code: string;
  display: string;
  header?: string;
  visible?: boolean;
  columnType?: ColumnType;
  imageConfig?: ImageConfig;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  filterable?: boolean;
  frozen?: boolean;
  filterConfig?: ColumnFilterConfig;
  mask?: MaskConfig;
  validation?: ValidationConfig;
  cellTemplate?: CellTemplateItem[];
  showOnColumnChooser?: boolean;
  cardViewConfig?: CardViewColumnConfig;
}

// ── Toolbar ─────────────────────────────────
export interface ToolbarAction {
  label: string;
  icon: string;
  key: string;
}

// ── Sizer Config ────────────────────────────
export interface DensitySetting {
  name: Density;
  cssClass: string;
  rowHeight: number;
}

export interface SizerConfig {
  enabled: boolean;
  defaultDensity: Density;
  densities: DensitySetting[];
  additionalReservedSpace?: number;
  autoSizeOffset?: number;
}

// ── Search Config ───────────────────────────
export interface SearchConfig {
  enabled: boolean;
  fields: string[];
  placeholder?: string;
  debounceTime?: number;
  highlightMatch?: boolean;
}

// ── Style Config ────────────────────────────
export interface StyleConfig {
  headerBackgroundColor?: string;
  footerBackgroundColor?: string;
  borderColor?: string;
  enableTransparency: boolean;
  transparencyOpacity?: number;
  glossyEffect?: boolean;
  backgroundImageUrl?: string;
}

// ── Card View Config ────────────────────────
export interface CardViewConfig {
  cardsPerRow: number;
}

// ── Map View Config ─────────────────────────
export interface MapViewConfig {
  enabled: boolean;
  latField: string;
  longField: string;
  tooltipField?: string;
}

// ── Footer Config ───────────────────────────
export interface FooterColumn {
  code: string;
  aggregation: "sum" | "avg" | "count";
  display: string;
}

export interface FooterConfig {
  enabled: boolean;
  columns: FooterColumn[];
}

// ── Row Menu ────────────────────────────────
export interface RowMenuItem {
  label: string;
  items: RowMenuSubItem[];
}

export interface RowMenuSubItem {
  label: string;
  icon?: string;
  action?: string;
  shortcut?: string;
  items?: RowMenuSubItem[];
}

export interface RowActionItem {
  label: string;
  icon: string;
  action: string;
  color?: string;
  shortcut?: string;
}

// ── Advanced Filters ────────────────────────
export interface FilterDefinition {
  code: string;
  name: string;
  type: "numeric" | "text" | "date" | "select";
  operators?: FilterOperator[];
  dateOperators?: DateOperator[];
  defaultOperator?: FilterOperator | DateOperator;
  value?: unknown;
  value2?: unknown;
  options?: string[];
}

export interface FilterGroup {
  name: string;
  collapsible: boolean;
  filters: FilterDefinition[];
}

export interface AdvancedFilterConfig {
  enabled: boolean;
  groups: FilterGroup[];
}

export interface ActiveFilter {
  code: string;
  name: string;
  type: "numeric" | "text" | "date" | "select";
  operator: FilterOperator | DateOperator;
  value1: unknown;
  value2?: unknown;
}

// ── Table State ─────────────────────────────
export interface TableState {
  viewMode: ViewMode;
  currentPage: number;
  pageSize: number;
  sortColumn: string | null;
  sortDirection: SortDirection;
  globalFilterTerm: string;
  advancedFilters: Record<string, ActiveFilter>;
  visibleColumnCodes: string[];
}

// ── Table Config (Main) ─────────────────────
export interface TableConfigSection {
  id: string;
  title: string;
  primaryKey?: string;
  dataStrategy: DataStrategy;
  pagingMode: PagingMode;
  infiniteScrollBehavior?: "append" | "replace";
  paginatorPosition?: PaginatorPosition;
  stripedRows?: boolean;
  showGridlines?: boolean;
  rowHover?: boolean;
  globalFilterFields?: string[];
  enableColumnChooser: boolean;
  showFilterByColor?: boolean;
  exportConfig?: ExportConfig;
  enableRowMenu: boolean;
  enableRowMenuIcons?: boolean;
  enableQuickActions?: boolean;
  enableHeaderActions: boolean;
  enableSavedQueries: boolean;
  enableConfigButton: boolean;
  enableChipFilters?: boolean;
  enableMultiSelect?: boolean;
  enableFreeze?: boolean;
  defaultRows: number;
  role: string;
  toolbarActions: ToolbarAction[];
  toolbarButtonMode?: "iconAndText" | "iconOnly";
  sizerConfig: SizerConfig;
  cardViewConfig?: CardViewConfig;
  emptyStateConfig?: EmptyStateConfig;
  footerConfig?: FooterConfig;
  searchConfig?: SearchConfig;
  styleConfig?: StyleConfig;
  autoSync?: boolean;
  mapViewConfig?: MapViewConfig;
}

export interface TableConfig {
  feature: string;
  key: string;
  api: TableApiConfig;
  config: TableConfigSection;
  columns: TableColumn[];
  rowMenu: RowMenuItem[];
  rowActions?: RowActionItem[];
  headerMenu?: RowMenuItem[];
  advancedFilters?: AdvancedFilterConfig;
}

// ── AICTable Props ────────────────────────
export interface AICTableProps {
  config: TableConfig;
  data?: unknown[];
  loading?: boolean;
  totalRecords?: number;
  className?: string;
  onRowClick?: (row: unknown) => void;
  onRowAction?: (action: string, row: unknown) => void;
  onToolbarAction?: (key: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSortChange?: (column: string, direction: SortDirection) => void;
  onFilterChange?: (filters: Record<string, ActiveFilter>) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  onExport?: (format: "csv" | "pdf" | "excel") => void;
  onViewModeChange?: (mode: ViewMode) => void;
}
