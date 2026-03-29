/* ------------------------------------------------------------------ */
/*  Dashboard + Reports module types                                  */
/* ------------------------------------------------------------------ */

// ── Shared Query Params ─────────────────────────────────────────────

export interface DashboardQueryParams {
  dateFrom: string;
  dateTo: string;
  userId?: string;
  groupBy?: "user" | "month" | "source" | "industry" | "city" | "product";
  source?: string;
  activityType?: string;
  metric?: string;
  period?: string;
  roleId?: string;
}

// ── Executive Dashboard ─────────────────────────────────────────────

export interface ExecutiveKpis {
  totalLeads: number;
  activeLeads: number;
  wonDeals: number;
  lostDeals: number;
  totalRevenue: number;
  conversionRate: number;
  avgDealSize: number;
  pendingActivities: number;
  [key: string]: unknown;
}

// ── Pipeline ────────────────────────────────────────────────────────

export interface PipelineStage {
  stage: string;
  count: number;
  value: number;
}

// ── Funnel ──────────────────────────────────────────────────────────

export interface FunnelStep {
  stage: string;
  count: number;
  percentage: number;
}

// ── Revenue Analytics ───────────────────────────────────────────────

export interface RevenueDataPoint {
  period: string;
  revenue: number;
  deals: number;
}

// ── Lead Sources ────────────────────────────────────────────────────

export interface LeadSourceItem {
  source: string;
  count: number;
  percentage: number;
}

// ── MIS Reports ─────────────────────────────────────────────────────

export type ReportCategory =
  | "Sales"
  | "Lead"
  | "Contact"
  | "Activity"
  | "Demo"
  | "Quotation"
  | "TourPlan"
  | "Team"
  | "Communication"
  | "Executive"
  | "Custom";

export interface ReportDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  category: ReportCategory;
  isActive: boolean;
}

export interface ReportColumn {
  key: string;
  label: string;
  type?: "string" | "number" | "date" | "currency";
  sortable?: boolean;
}

export interface ReportResult {
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  summary?: Record<string, unknown>;
  generatedAt: string;
}

export interface GenerateReportParams {
  dateFrom: string;
  dateTo: string;
  userId?: string;
  groupBy?: string;
  filters?: Record<string, unknown>;
  comparePrevious?: boolean;
}

export type ExportFormat = "PDF" | "EXCEL" | "CSV";

export interface ExportReportParams extends GenerateReportParams {
  format: ExportFormat;
}

export interface DrillDownParams {
  dimension: string;
  value: string;
  dateFrom: string;
  dateTo: string;
  filters?: Record<string, unknown>;
  page?: number;
  limit?: number;
}

export interface ExportHistoryItem {
  id: string;
  reportCode: string;
  reportName: string;
  format: ExportFormat;
  status: "PENDING" | "COMPLETED" | "FAILED";
  fileUrl?: string;
  createdAt: string;
  exportSource?: string;
}

export interface ExportHistoryParams {
  reportCode?: string;
  exportSource?: string;
  page?: number;
  limit?: number;
}

// ── Activity Heatmap ─────────────────────────────────────────────────

export interface HeatmapCell {
  day: number;   // 0=Sun … 6=Sat
  hour: number;  // 0–23
  count: number;
}

// ── Lost Reasons ─────────────────────────────────────────────────────

export interface LostReasonItem {
  reason: string;
  count: number;
  percentage: number;
}

// ── Aging Distribution ───────────────────────────────────────────────

export interface AgingBucket {
  bucket: string;      // e.g. "0-7 days", "8-15 days"
  count: number;
  avgValue: number;
}

// ── Velocity Metrics ─────────────────────────────────────────────────

export interface VelocityMetrics {
  avgDaysToClose: number;
  avgDaysInStage: Record<string, number>;
  trend: { period: string; avgDays: number }[];
}

// ── My Dashboard (personal) ──────────────────────────────────────────

export interface MyDashboardData {
  totalLeads: number;
  activeLeads: number;
  wonDeals: number;
  lostDeals: number;
  totalRevenue: number;
  conversionRate: number;
  avgDealSize: number;
  pendingActivities: number;
  todayActivities: number;
  overdueFollowUps: number;
  recentLeads: { id: string; title: string; status: string; value: number; createdAt: string }[];
  upcomingActivities: { id: string; title: string; type: string; dueDate: string }[];
  [key: string]: unknown;
}
