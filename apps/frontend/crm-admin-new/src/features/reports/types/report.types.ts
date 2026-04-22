/* ------------------------------------------------------------------ */
/*  Report Template Designer + Viewer types                           */
/* ------------------------------------------------------------------ */

// ── Backend ReportData types (match API response) ────────────────────

export interface ReportMetric {
  key: string;
  label: string;
  value: number;
  previousValue?: number;
  changePercent?: number;
  changeDirection?: 'UP' | 'DOWN' | 'FLAT';
  format?: 'number' | 'currency' | 'percent' | 'days';
}

export interface ChartDataset {
  label: string;
  data: number[];
  color?: string;
}

export type ChartType = 'BAR' | 'LINE' | 'PIE' | 'DONUT' | 'FUNNEL' | 'HEATMAP' | 'STACKED_BAR' | 'AREA' | 'TABLE';

export interface ChartData {
  type: ChartType;
  title: string;
  labels: string[];
  datasets: ChartDataset[];
}

export interface ColumnDef {
  key: string;
  header: string;
  width?: number;
  format?: 'currency' | 'date' | 'percent' | 'number';
}

export interface ReportTable {
  title: string;
  columns: ColumnDef[];
  rows: Record<string, unknown>[];
}

export interface ReportData {
  reportCode: string;
  reportName: string;
  category: string;
  generatedAt: string;
  params: Record<string, unknown>;
  summary: ReportMetric[];
  charts: ChartData[];
  tables: ReportTable[];
  comparison?: { metrics: ReportMetric[] };
  metadata?: Record<string, unknown>;
}

// ── Report Definition ────────────────────────────────────────────────

export type ReportCategory =
  | 'SALES' | 'LEAD' | 'CONTACT_ORG' | 'ACTIVITY' | 'DEMO'
  | 'QUOTATION' | 'TOUR_PLAN' | 'TEAM' | 'COMMUNICATION'
  | 'EXECUTIVE' | 'CUSTOM';

export interface ReportDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  category: ReportCategory;
  supportsDrillDown: boolean;
  supportsPeriodComparison: boolean;
  availableFormats: string[];
  isActive: boolean;
  sortOrder: number;
}

// ── Template Designer ────────────────────────────────────────────────

export type SectionType =
  | 'heading' | 'text' | 'divider' | 'spacer'
  | 'kpi-row' | 'chart' | 'table' | 'comparison'
  | 'data-field' | 'formula' | 'image' | 'group-header' | 'summary-row';

export interface HeadingSection {
  id: string;
  type: 'heading';
  level: 1 | 2 | 3;
  text: string;
  align?: 'left' | 'center' | 'right';
}

export interface TextSection {
  id: string;
  type: 'text';
  content: string;
}

export interface DividerSection {
  id: string;
  type: 'divider';
}

export interface SpacerSection {
  id: string;
  type: 'spacer';
  height: number;
}

export interface KpiRowSection {
  id: string;
  type: 'kpi-row';
  metricKeys?: string[];
  columns?: 2 | 3 | 4 | 5;
}

export interface ChartSection {
  id: string;
  type: 'chart';
  chartIndex?: number;
  overrideChartType?: ChartType;
  height?: number;
  /** Custom chart config: entity + measure field + dimension field */
  entityKey?: string;
  measureField?: string;
  measureAggregation?: string;
  dimensionField?: string;
}

export interface TableSection {
  id: string;
  type: 'table';
  tableIndex?: number;
  visibleColumns?: string[];
  pageSize?: number;
  /** Custom table: entity + selected fields */
  entityKey?: string;
  selectedFields?: string[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  groupByField?: string;
}

export interface DataFieldSection {
  id: string;
  type: 'data-field';
  entityKey: string;
  fieldKey: string;
  label?: string;
  aggregation?: string;
  format?: string;
}

export interface FormulaSection {
  id: string;
  type: 'formula';
  label: string;
  expression: string;
  format?: 'number' | 'currency' | 'percent';
}

export interface ImageSection {
  id: string;
  type: 'image';
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  align?: 'left' | 'center' | 'right';
}

export interface GroupHeaderSection {
  id: string;
  type: 'group-header';
  entityKey: string;
  groupByField: string;
  showCount?: boolean;
  showSubtotal?: boolean;
  subtotalField?: string;
}

export interface SummaryRowSection {
  id: string;
  type: 'summary-row';
  fields: Array<{ fieldKey: string; aggregation: string; label?: string }>;
}

export interface ComparisonSection {
  id: string;
  type: 'comparison';
  metricKeys?: string[];
}

export type TemplateSection =
  | HeadingSection | TextSection | DividerSection | SpacerSection
  | KpiRowSection | ChartSection | TableSection | ComparisonSection
  | DataFieldSection | FormulaSection | ImageSection | GroupHeaderSection | SummaryRowSection;

export interface TemplateFilter {
  fieldKey: string;
  operator: string;
  value: unknown;
  value2?: unknown;
}

export interface TemplateDataSource {
  entityKey: string;
  filters?: TemplateFilter[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  groupByField?: string;
  limit?: number;
}

export interface TemplateLayout {
  sections: TemplateSection[];
  dataSource?: TemplateDataSource;
  theme?: {
    primaryColor: string;
    headerBg: string;
  };
  orientation?: 'portrait' | 'landscape';
}

export interface ReportTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  reportDefId?: string;
  reportDef?: ReportDefinition;
  layout: TemplateLayout;
  dataSource?: Record<string, unknown>;
  isPublic: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplatePayload {
  name: string;
  description?: string;
  reportCode?: string;
  layout: TemplateLayout;
  dataSource?: Record<string, unknown>;
  isPublic?: boolean;
}

export interface UpdateTemplatePayload {
  name?: string;
  description?: string;
  layout?: TemplateLayout;
  dataSource?: Record<string, unknown>;
  isPublic?: boolean;
}

// ── Bookmarks ────────────────────────────────────────────────────────

export interface ReportBookmark {
  id: string;
  reportDefId: string;
  reportDef: ReportDefinition;
  name: string;
  filters?: Record<string, unknown>;
  isPinned: boolean;
  userId: string;
  createdAt: string;
}

export interface CreateBookmarkPayload {
  reportCode: string;
  name: string;
  filters?: Record<string, unknown>;
  isPinned?: boolean;
}

// ── Schedules ────────────────────────────────────────────────────────

export type ReportFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type ScheduleStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

export interface ScheduledReport {
  id: string;
  reportDefId: string;
  reportDef: ReportDefinition;
  name: string;
  filters?: Record<string, unknown>;
  format: string;
  frequency: ReportFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  timeOfDay: string;
  timezone: string;
  recipientEmails: string[];
  status: ScheduleStatus;
  lastSentAt?: string;
  nextScheduledAt?: string;
  lastError?: string;
  sendCount: number;
  createdAt: string;
}

export interface CreateSchedulePayload {
  name: string;
  reportCode: string;
  frequency: ReportFrequency;
  format: string;
  filters?: Record<string, unknown>;
  recipientEmails: string[];
  dayOfWeek?: number;
  dayOfMonth?: number;
  timeOfDay?: string;
}

export interface UpdateSchedulePayload {
  name?: string;
  frequency?: ReportFrequency;
  format?: string;
  filters?: Record<string, unknown>;
  recipientEmails?: string[];
  dayOfWeek?: number;
  dayOfMonth?: number;
  timeOfDay?: string;
  status?: ScheduleStatus;
}

// ── Generate / Export params ─────────────────────────────────────────

export interface GenerateReportParams {
  dateFrom: string;
  dateTo: string;
  userId?: string;
  groupBy?: string;
  filters?: Record<string, unknown>;
  comparePrevious?: boolean;
}

export type ExportFormat = 'PDF' | 'XLSX' | 'CSV';

export interface ExportReportParams extends GenerateReportParams {
  format: ExportFormat;
}

export interface ExportHistoryItem {
  id: string;
  reportCode: string;
  reportName: string;
  format: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  fileUrl?: string;
  fileSize?: number;
  recordCount?: number;
  createdAt: string;
}

// ── Drill-Down ───────────────────────────────────────────────────────

export interface DrillDownParams {
  dimension: string;
  value: string;
  dateFrom: string;
  dateTo: string;
  filters?: Record<string, unknown>;
  page?: number;
  limit?: number;
}

export interface DrillDownResult {
  dimension: string;
  value: string;
  columns: ColumnDef[];
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
}
