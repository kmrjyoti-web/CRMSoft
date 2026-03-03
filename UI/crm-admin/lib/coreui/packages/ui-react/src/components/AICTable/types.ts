/**
 * Types for AICTableFull component — the feature-rich data table
 * with 10 view modes, filter sidebar, column management, and validation.
 */

export type AICTableFullViewMode =
  | 'table'
  | 'list'
  | 'card'
  | 'calendar'
  | 'map'
  | 'bi'
  | 'timeline'
  | 'chart'
  | 'tree'
  | 'kanban';

export type AICTableFullDensity = 'comfortable' | 'cozy' | 'compact';

export interface ColumnDef {
  id: string;
  label: string;
  visible: boolean;
  pinned?: 'left' | 'right' | null;
}

export interface KanbanSettings {
  name: string;
  categorizeBy: string;
  aggregateBy: string;
  headerStyle: 'Mono Color' | 'Multi Color';
  selectedFields: string[];
}

export interface TreeSettings {
  name: string;
  levels: string[];
  selectedFields: string[];
}

export interface CalendarSettings {
  dateField: string;
  labelField: string;
}

export interface ChartSettings {
  xAxis: string;
  yAxis: string;
  aggregation: 'sum' | 'count' | 'average';
  chartType: 'bar' | 'line' | 'pie';
}

export interface BIWidget {
  id: string;
  type: 'pivot' | 'card' | 'chart';
  title: string;
  rows?: string[];
  columns?: string[];
  xAxis?: string;
  chartType?: 'bar' | 'line' | 'pie';
  values: string;
  aggregation: 'sum' | 'count' | 'average';
}

export interface BISettings {
  widgets: BIWidget[];
}

export interface ValidationRule {
  id: string;
  field: string;
  type: 'string' | 'number' | 'date' | 'email' | 'phone';
  condition: string;
  value: string | number;
}

// ── Filter System Types ──────────────────────────────────

export type ColumnFilterType = 'text' | 'number' | 'date' | 'master' | 'boolean';

export interface ColumnFilterDef {
  columnId: string;
  label: string;
  filterType: ColumnFilterType;
  options?: { value: string; label: string }[];
  queryParam: string;
}

export interface FilterSectionDef {
  title: string;
  defaultOpen?: boolean;
  filters: ColumnFilterDef[];
}

export interface TableFilterConfig {
  sections: FilterSectionDef[];
}

export type FilterValue =
  | { type: 'text'; value: string }
  | { type: 'number'; min?: number; max?: number }
  | { type: 'date'; from?: string; to?: string }
  | { type: 'master'; selected: string[] }
  | { type: 'boolean'; value: boolean };

export type FilterValues = Record<string, FilterValue>;

// ── AICTableFull Props ───────────────────────────────────

export interface AICTableFullProps {
  /** Array of data records to display */
  data: Record<string, any>[];
  /** Title shown in the header */
  title?: string;
  /** Additional CSS class name */
  className?: string;
  /** Initial view mode */
  defaultViewMode?: AICTableFullViewMode;
  /** Initial density */
  defaultDensity?: AICTableFullDensity;
  /** Column definitions (defaults to auto-generated from data keys) */
  columns?: ColumnDef[];
  /** Called when a row's edit action is triggered */
  onRowEdit?: (row: any) => void;
  /** Called when a row's delete action is triggered */
  onRowDelete?: (row: any) => void;
  /** Called when a row's copy action is triggered */
  onRowCopy?: (row: any) => void;
  /** Called when a row's archive action is triggered */
  onRowArchive?: (row: any) => void;
  /** Called when the create button is clicked */
  onCreate?: () => void;
  /** Dynamic filter configuration for the sidebar */
  filterConfig?: TableFilterConfig;
  /** Callback when filters are applied */
  onFilterChange?: (filters: FilterValues) => void;
  /** Callback when filters are cleared */
  onFilterClear?: () => void;
  /** Current active filter values (controlled mode) */
  activeFilters?: FilterValues;
  /** Set of selected row IDs (controlled) */
  selectedIds?: Set<string>;
  /** Called when row selection changes */
  onSelectionChange?: (ids: Set<string>) => void;
  /** Custom content rendered next to the Create button (replaces dummy ... button) */
  headerActions?: React.ReactNode;
}
