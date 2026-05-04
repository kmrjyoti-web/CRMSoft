/**
 * Interfaces for report rendering (export to file formats).
 */
import { ReportData } from './report.interface';

/** Options controlling how a report is rendered to a file */
export interface RenderOptions {
  /** Custom title override (defaults to report name) */
  title?: string;
  /** Page orientation for PDF/XLSX */
  orientation?: 'portrait' | 'landscape';
  /** Whether to include chart images in the export */
  includeCharts?: boolean;
  /** Whether to include the generation timestamp */
  includeTimestamp?: boolean;
}

/**
 * Contract for a report renderer that converts ReportData into a file buffer.
 * Implementations exist for Excel, CSV, and PDF formats.
 */
export interface IReportRenderer {
  /**
   * Render report data into a file buffer.
   * @param data - The complete report data to render
   * @param options - Optional rendering configuration
   * @returns Buffer containing the rendered file contents
   */
  render(data: ReportData, options?: RenderOptions): Promise<Buffer>;
}
