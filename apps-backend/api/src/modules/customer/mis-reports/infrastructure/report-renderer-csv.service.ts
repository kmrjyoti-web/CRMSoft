import { Injectable } from '@nestjs/common';
import { IReportRenderer, RenderOptions } from '../interfaces/renderer.interface';
import { ReportData } from '../interfaces/report.interface';

/**
 * Renders the primary table from MIS report data to CSV format.
 * Handles proper escaping of commas, quotes, and newlines.
 * Currency values are formatted with the Rupee symbol.
 */
@Injectable()
export class ReportRendererCsvService implements IReportRenderer {
  /**
   * Render report data into a CSV buffer.
   * Uses the first table in ReportData.tables as the primary data source.
   * @param data - Complete report data
   * @param _options - Render options (not used for CSV)
   * @returns Buffer containing UTF-8 encoded CSV with BOM
   */
  async render(data: ReportData, _options?: RenderOptions): Promise<Buffer> {
    const table = data.tables[0];
    if (!table || !table.columns.length) {
      return Buffer.from('No data available', 'utf-8');
    }

    const lines: string[] = [];

    // Header line
    lines.push(table.columns.map(col => this.escape(col.header)).join(','));

    // Data lines
    for (const row of table.rows) {
      const values = table.columns.map(col => {
        const raw = row[col.key];
        const formatted = this.formatValue(raw, col.format);
        return this.escape(formatted);
      });
      lines.push(values.join(','));
    }

    // UTF-8 BOM for proper Excel display of special characters (e.g., Rupee symbol)
    const bom = '\uFEFF';
    return Buffer.from(bom + lines.join('\n'), 'utf-8');
  }

  /**
   * Escape a value for safe inclusion in a CSV field.
   * Wraps in double-quotes if the value contains commas, quotes, or newlines.
   * @param val - Raw value to escape
   * @returns Escaped CSV field string
   */
  private escape(val: any): string {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  /**
   * Format a raw value based on the column format hint.
   * @param val - Raw cell value
   * @param format - Column format: 'currency', 'date', 'percent', or 'number'
   * @returns Formatted string representation
   */
  private formatValue(val: any, format?: string): string {
    if (val === null || val === undefined) return '';
    switch (format) {
      case 'currency':
        return typeof val === 'number'
          ? `\u20B9${val.toLocaleString('en-IN')}` : String(val);
      case 'date':
        return val ? new Date(val).toLocaleDateString('en-IN') : '';
      case 'percent':
        return typeof val === 'number' ? `${val.toFixed(1)}%` : String(val);
      case 'number':
        return typeof val === 'number' ? val.toLocaleString('en-IN') : String(val);
      default:
        return String(val);
    }
  }
}
