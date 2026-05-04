import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { IReportRenderer, RenderOptions } from '../interfaces/renderer.interface';
import { ReportData, ReportMetric, ColumnDef } from '../interfaces/report.interface';

/** Header style: blue background, white bold text */
const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3B82F6' } };
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
const ALT_ROW_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F3F4F6' } };
const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin' }, bottom: { style: 'thin' },
  left: { style: 'thin' }, right: { style: 'thin' },
};

/**
 * Renders MIS report data to Excel (XLSX) format using ExcelJS.
 * Creates a summary sheet with metrics and one data sheet per table.
 */
@Injectable()
export class ReportRendererExcelService implements IReportRenderer {
  /**
   * Render report data into an Excel buffer.
   * @param data - Complete report data
   * @param options - Optional rendering configuration
   * @returns Buffer containing the XLSX file
   */
  async render(data: ReportData, options?: RenderOptions): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'MIS Reports';
    workbook.created = new Date();

    this.buildSummarySheet(workbook, data, options);

    for (const table of data.tables) {
      this.buildDataSheet(workbook, table.title, table.columns, table.rows);
    }

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Build the summary sheet with report title, date range, and KPI metrics.
   * @param workbook - ExcelJS workbook instance
   * @param data - Report data containing summary metrics
   * @param options - Render options
   */
  private buildSummarySheet(
    workbook: ExcelJS.Workbook,
    data: ReportData,
    options?: RenderOptions,
  ): void {
    const sheet = workbook.addWorksheet('Summary');
    const title = options?.title || data.reportName;

    // Title
    sheet.mergeCells(1, 1, 1, 4);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = title;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Date range
    sheet.mergeCells(2, 1, 2, 4);
    const dateCell = sheet.getCell(2, 1);
    const from = new Date(data.params.dateFrom).toLocaleDateString('en-IN');
    const to = new Date(data.params.dateTo).toLocaleDateString('en-IN');
    dateCell.value = `Period: ${from} - ${to}`;
    dateCell.font = { size: 11, italic: true };
    dateCell.alignment = { horizontal: 'center' };

    if (options?.includeTimestamp !== false) {
      sheet.mergeCells(3, 1, 3, 4);
      const tsCell = sheet.getCell(3, 1);
      tsCell.value = `Generated: ${data.generatedAt.toLocaleString('en-IN')}`;
      tsCell.font = { size: 10, italic: true, color: { argb: '6B7280' } };
      tsCell.alignment = { horizontal: 'center' };
    }

    // Metrics table header row
    const headerRow = 5;
    const metricHeaders = ['Metric', 'Value', 'Previous', 'Change'];
    metricHeaders.forEach((h, i) => {
      const cell = sheet.getCell(headerRow, i + 1);
      cell.value = h;
      cell.font = HEADER_FONT;
      cell.fill = HEADER_FILL;
      cell.border = THIN_BORDER;
    });
    sheet.getColumn(1).width = 30;
    sheet.getColumn(2).width = 20;
    sheet.getColumn(3).width = 20;
    sheet.getColumn(4).width = 18;

    // Metric rows
    data.summary.forEach((metric, idx) => {
      const row = headerRow + 1 + idx;
      sheet.getCell(row, 1).value = metric.label;
      sheet.getCell(row, 2).value = this.formatMetricValue(metric.value, metric.format);
      sheet.getCell(row, 3).value = metric.previousValue != null
        ? this.formatMetricValue(metric.previousValue, metric.format) : '-';
      sheet.getCell(row, 4).value = metric.changePercent != null
        ? `${metric.changeDirection === 'DOWN' ? '-' : '+'}${Math.abs(metric.changePercent).toFixed(1)}%` : '-';

      if (idx % 2 === 1) {
        for (let c = 1; c <= 4; c++) sheet.getCell(row, c).fill = ALT_ROW_FILL;
      }
      for (let c = 1; c <= 4; c++) sheet.getCell(row, c).border = THIN_BORDER;
    });
  }

  /**
   * Build a data sheet for a single table with styled headers and auto-filter.
   * @param workbook - ExcelJS workbook instance
   * @param title - Sheet/table title
   * @param columns - Column definitions
   * @param rows - Data rows
   */
  private buildDataSheet(
    workbook: ExcelJS.Workbook,
    title: string,
    columns: ColumnDef[],
    rows: Record<string, unknown>[],
  ): void {
    const sheetName = title.substring(0, 31).replace(/[\\/*?[\]:]/g, '');
    const sheet = workbook.addWorksheet(sheetName);

    // Title row
    if (columns.length > 0) {
      sheet.mergeCells(1, 1, 1, columns.length);
      const titleCell = sheet.getCell(1, 1);
      titleCell.value = title;
      titleCell.font = { size: 14, bold: true };
      titleCell.alignment = { horizontal: 'center' };
    }

    // Header row
    const headerRowNum = 3;
    columns.forEach((col, i) => {
      const cell = sheet.getCell(headerRowNum, i + 1);
      cell.value = col.header;
      cell.font = HEADER_FONT;
      cell.fill = HEADER_FILL;
      cell.border = THIN_BORDER;
      if (col.width) sheet.getColumn(i + 1).width = col.width;
    });

    // Data rows
    rows.forEach((row, rowIdx) => {
      const excelRow = sheet.getRow(headerRowNum + 1 + rowIdx);
      columns.forEach((col, colIdx) => {
        const cell = excelRow.getCell(colIdx + 1);
        cell.value = this.formatCellValue(row[col.key], col.format);
        cell.border = THIN_BORDER;
      });
      if (rowIdx % 2 === 1) {
        excelRow.eachCell(c => { c.fill = ALT_ROW_FILL; });
      }
    });

    if (columns.length > 0 && rows.length > 0) {
      sheet.autoFilter = {
        from: { row: headerRowNum, column: 1 },
        to: { row: headerRowNum, column: columns.length },
      };
    }
  }

  /**
   * Format a metric value for display in the summary sheet.
   * @param value - Numeric value
   * @param format - Format hint
   * @returns Formatted string
   */
  private formatMetricValue(value: number, format?: string): string {
    switch (format) {
      case 'currency': return `\u20B9${value.toLocaleString('en-IN')}`;
      case 'percent': return `${value.toFixed(1)}%`;
      case 'days': return `${value.toFixed(1)} days`;
      default: return value.toLocaleString('en-IN');
    }
  }

  /**
   * Format an individual cell value based on column format.
   * @param val - Raw cell value
   * @param format - Column format hint
   * @returns Formatted value for Excel cell
   */
  private formatCellValue(val: unknown, format?: string): any {
    if (val === null || val === undefined) return '';
    if (format === 'date' && val) return new Date(val as any).toLocaleDateString('en-IN');
    if (format === 'currency' && typeof val === 'number') return `\u20B9${val.toLocaleString('en-IN')}`;
    if (format === 'percent' && typeof val === 'number') return `${val.toFixed(1)}%`;
    return val;
  }
}
