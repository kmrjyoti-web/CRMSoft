/**
 * Core interfaces for the MIS Reports module.
 * Defines all data structures for report generation, charting, drill-down, and export.
 */

/** Parameters for generating any MIS report */
export interface ReportParams {
  dateFrom: Date;
  dateTo: Date;
  /** Filter by specific user */
  userId?: string;
  /** Group results by dimension: "user","month","source","industry","city","product" */
  groupBy?: string;
  /** Flexible key-value filters for report-specific criteria */
  filters?: Record<string, any>;
  /** Enable comparison with the previous period of equal duration */
  comparePrevious?: boolean;
  /** Auto-filled by tenant middleware */
  tenantId?: string;
  /** Page number for paginated results (1-based) */
  page?: number;
  /** Number of records per page */
  limit?: number;
}

/** A single summary metric within a report */
export interface ReportMetric {
  /** Unique key identifying this metric */
  key: string;
  /** Human-readable label */
  label: string;
  /** Current period value */
  value: number;
  /** Previous period value (populated when comparePrevious=true) */
  previousValue?: number;
  /** Percentage change from previous period */
  changePercent?: number;
  /** Direction of change */
  changeDirection?: 'UP' | 'DOWN' | 'FLAT';
  /** Display format hint for the frontend */
  format?: 'number' | 'currency' | 'percent' | 'days';
}

/** Chart visualization data */
export interface ChartData {
  /** Chart type to render */
  type: 'BAR' | 'LINE' | 'PIE' | 'DONUT' | 'FUNNEL' | 'HEATMAP' | 'STACKED_BAR' | 'AREA' | 'TABLE';
  /** Chart title */
  title: string;
  /** X-axis or category labels */
  labels: string[];
  /** One or more data series */
  datasets: Array<{ label: string; data: number[]; color?: string }>;
}

/** Column definition for tabular data */
export interface ColumnDef {
  /** Data key in the row object */
  key: string;
  /** Display header text */
  header: string;
  /** Suggested column width */
  width?: number;
  /** Value format hint */
  format?: 'currency' | 'date' | 'percent' | 'number';
}

/** Complete report output returned by any report generator */
export interface ReportData {
  /** Unique report code identifier */
  reportCode: string;
  /** Human-readable report name */
  reportName: string;
  /** Report category (SALES, LEAD, ACTIVITY, etc.) */
  category: string;
  /** Timestamp when the report was generated */
  generatedAt: Date;
  /** Parameters used to generate this report */
  params: ReportParams;
  /** Summary KPI metrics */
  summary: ReportMetric[];
  /** Chart visualizations */
  charts: ChartData[];
  /** Tabular data sections */
  tables: Array<{ title: string; columns: ColumnDef[]; rows: any[] }>;
  /** Period comparison data (populated when comparePrevious=true) */
  comparison?: { metrics: ReportMetric[] };
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/** Parameters for drill-down into a specific dimension */
export interface DrillDownParams {
  /** Report code to drill into */
  reportCode: string;
  /** Dimension being drilled (e.g., "user", "status") */
  dimension: string;
  /** Value of the dimension to filter by */
  value: string;
  dateFrom: Date;
  dateTo: Date;
  /** Additional filters */
  filters?: Record<string, any>;
  /** Page number (1-based) */
  page: number;
  /** Records per page */
  limit: number;
}

/** Result of a drill-down query */
export interface DrillDownResult {
  /** Dimension that was drilled into */
  dimension: string;
  /** Value that was filtered */
  value: string;
  /** Column definitions for the result table */
  columns: ColumnDef[];
  /** Data rows */
  rows: any[];
  /** Total matching records */
  total: number;
  page: number;
  limit: number;
}

/** Result of an export operation */
export interface ExportResult {
  /** Path or URL to the exported file */
  fileUrl: string;
  /** File name with extension */
  fileName: string;
  /** File size in bytes */
  fileSize: number;
  /** Number of data records exported */
  recordCount: number;
  /** Time taken to generate the file in milliseconds */
  generationTimeMs: number;
}
