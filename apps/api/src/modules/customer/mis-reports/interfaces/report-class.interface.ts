/**
 * Interfaces defining the contract for individual report implementations
 * and their filter definitions.
 */
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from './report.interface';

/** Definition for a single filter field exposed by a report */
export interface FilterDefinition {
  /** Unique key for this filter */
  key: string;
  /** Human-readable label */
  label: string;
  /** Input type for the filter control */
  type: 'date_range' | 'select' | 'multi_select' | 'text' | 'user' | 'boolean';
  /** Available options for select/multi_select types */
  options?: Array<{ value: string; label: string }>;
  /** Whether this filter is required */
  required?: boolean;
  /** Default value for the filter */
  defaultValue?: any;
}

/**
 * Contract that every MIS report class must implement.
 * Each report is self-describing via its metadata properties
 * and provides generate() plus optional drillDown() methods.
 */
export interface IReport {
  /** Unique report code (e.g., "LEAD_STATUS_SUMMARY") */
  readonly code: string;
  /** Human-readable report name */
  readonly name: string;
  /** Report category (maps to ReportCategory enum) */
  readonly category: string;
  /** Brief description of what this report shows */
  readonly description: string;
  /** Filter definitions available for this report */
  readonly availableFilters: FilterDefinition[];
  /** Whether this report supports drill-down into rows */
  readonly supportsDrillDown: boolean;
  /** Whether this report supports period-over-period comparison */
  readonly supportsPeriodComparison: boolean;

  /**
   * Generate the full report data for the given parameters.
   * @param params - Report generation parameters including date range and filters
   * @returns Complete report data with summary, charts, and tables
   */
  generate(params: ReportParams): Promise<ReportData>;

  /**
   * Drill down into a specific dimension value to see underlying records.
   * Only available when supportsDrillDown is true.
   * @param params - Drill-down parameters specifying dimension and value
   * @returns Paginated list of underlying records
   */
  drillDown?(params: DrillDownParams): Promise<DrillDownResult>;
}
