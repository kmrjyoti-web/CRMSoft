import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { IReportRenderer, RenderOptions } from '../interfaces/renderer.interface';
import { ReportData, ReportMetric, ColumnDef } from '../interfaces/report.interface';

const PAGE_MARGIN = 40; const COL_BLUE = '#3B82F6'; const COL_GRAY = '#F3F4F6';
const COL_DARK = '#1F2937'; const COL_MUTED = '#6B7280';

/**
 * Renders MIS report data to PDF format using PDFKit.
 * Produces a styled document with title, date range, summary metrics,
 * and tabular data with alternating row backgrounds and page numbers.
 */
@Injectable()
export class ReportRendererPdfService implements IReportRenderer {
  /**
   * Render report data into a PDF buffer.
   * @param data - Complete report data
   * @param options - Optional rendering configuration
   * @returns Buffer containing the PDF file
   */
  async render(data: ReportData, options?: RenderOptions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: PAGE_MARGIN, size: 'A4', bufferPages: true,
        layout: options?.orientation === 'landscape' ? 'landscape' : 'portrait',
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.renderTitle(doc, data, options);
      this.renderSummary(doc, data.summary);
      this.renderTables(doc, data);
      this.addPageNumbers(doc);

      doc.end();
    });
  }

  /**
   * Render the title and subtitle at the top of the first page.
   * @param doc - PDFKit document instance
   * @param data - Report data
   * @param options - Render options
   */
  private renderTitle(doc: PDFKit.PDFDocument, data: ReportData, options?: RenderOptions): void {
    const title = options?.title || data.reportName;
    const pageWidth = doc.page.width - PAGE_MARGIN * 2;

    doc.fontSize(20).font('Helvetica-Bold').fillColor(COL_DARK)
      .text(title, PAGE_MARGIN, PAGE_MARGIN, { width: pageWidth, align: 'center' });

    doc.moveDown(0.3);
    const from = new Date(data.params.dateFrom).toLocaleDateString('en-IN');
    const to = new Date(data.params.dateTo).toLocaleDateString('en-IN');
    doc.fontSize(11).font('Helvetica').fillColor(COL_MUTED)
      .text(`Period: ${from} - ${to}`, { width: pageWidth, align: 'center' });

    if (options?.includeTimestamp !== false) {
      doc.fontSize(9).text(`Generated: ${data.generatedAt.toLocaleString('en-IN')}`, {
        width: pageWidth, align: 'center',
      });
    }
    doc.moveDown(1);
  }

  /**
   * Render the summary metrics section in a 2-column key-value layout.
   * @param doc - PDFKit document instance
   * @param metrics - Array of report metrics
   */
  private renderSummary(doc: PDFKit.PDFDocument, metrics: ReportMetric[]): void {
    if (!metrics.length) return;

    doc.fontSize(14).font('Helvetica-Bold').fillColor(COL_DARK).text('Summary');
    doc.moveDown(0.5);

    const colWidth = (doc.page.width - PAGE_MARGIN * 2) / 2;
    const startY = doc.y;

    metrics.forEach((metric, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = PAGE_MARGIN + col * colWidth;
      const y = startY + row * 22;

      if (y > doc.page.height - 80) {
        doc.addPage();
        return;
      }

      doc.fontSize(10).font('Helvetica-Bold').fillColor(COL_DARK)
        .text(`${metric.label}:`, x, y, { continued: true, width: colWidth });
      doc.font('Helvetica').fillColor(COL_BLUE)
        .text(` ${this.formatMetric(metric)}`, { continued: false });
    });

    const lastRow = Math.ceil(metrics.length / 2);
    doc.y = startY + lastRow * 22 + 10;
    doc.moveDown(0.5);
  }

  /** Render all tables from the report data */
  private renderTables(doc: PDFKit.PDFDocument, data: ReportData): void {
    for (const table of data.tables) {
      if (table.columns.length) this.renderTable(doc, table.title, table.columns, table.rows);
    }
  }

  /**
   * Render a single table with column headers and data rows.
   * @param doc - PDFKit document instance
   * @param title - Table title
   * @param columns - Column definitions
   * @param rows - Data rows
   */
  private renderTable(
    doc: PDFKit.PDFDocument, title: string, columns: ColumnDef[], rows: any[],
  ): void {
    const pageWidth = doc.page.width - PAGE_MARGIN * 2;
    const totalDefined = columns.reduce((s, c) => s + (c.width || 0), 0);
    const defaultW = totalDefined > 0 ? 0 : pageWidth / columns.length;

    const colWidths = columns.map(c => {
      if (!c.width) return defaultW || (pageWidth / columns.length);
      return (c.width / (totalDefined || 1)) * pageWidth;
    });

    if (doc.y > doc.page.height - 120) doc.addPage();

    doc.fontSize(12).font('Helvetica-Bold').fillColor(COL_DARK).text(title);
    doc.moveDown(0.3);

    // Header
    const headerY = doc.y;
    let xPos = PAGE_MARGIN;
    doc.rect(PAGE_MARGIN, headerY, pageWidth, 18).fill(COL_BLUE);
    columns.forEach((col, i) => {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('white')
        .text(col.header, xPos + 3, headerY + 4, { width: colWidths[i] - 6, lineBreak: false });
      xPos += colWidths[i];
    });
    doc.y = headerY + 20;

    // Rows
    const rowHeight = 16;
    for (let r = 0; r < rows.length; r++) {
      if (doc.y + rowHeight > doc.page.height - 50) doc.addPage();

      const rowY = doc.y;
      if (r % 2 === 1) {
        doc.rect(PAGE_MARGIN, rowY, pageWidth, rowHeight).fill(COL_GRAY);
      }

      xPos = PAGE_MARGIN;
      columns.forEach((col, i) => {
        const val = this.formatCell(rows[r][col.key], col.format);
        doc.fontSize(7).font('Helvetica').fillColor(COL_DARK)
          .text(val, xPos + 3, rowY + 3, { width: colWidths[i] - 6, lineBreak: false });
        xPos += colWidths[i];
      });
      doc.y = rowY + rowHeight;
    }
    doc.moveDown(1);
  }

  /** Add page numbers at the bottom of each page */
  private addPageNumbers(doc: PDFKit.PDFDocument): void {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).font('Helvetica').fillColor(COL_MUTED)
        .text(`Page ${i + 1} of ${pageCount}`,
          PAGE_MARGIN, doc.page.height - 30,
          { width: doc.page.width - PAGE_MARGIN * 2, align: 'center' });
    }
  }

  /** Format a metric value for the summary section */
  private formatMetric(metric: ReportMetric): string {
    const v = metric.value;
    if (metric.format === 'currency') return `\u20B9${v.toLocaleString('en-IN')}`;
    if (metric.format === 'percent') return `${v.toFixed(1)}%`;
    if (metric.format === 'days') return `${v.toFixed(1)} days`;
    return v.toLocaleString('en-IN');
  }

  /** Format a cell value based on column format */
  private formatCell(val: any, format?: string): string {
    if (val === null || val === undefined) return '';
    if (format === 'date' && val) return new Date(val).toLocaleDateString('en-IN');
    if (format === 'currency' && typeof val === 'number') return `\u20B9${val.toLocaleString('en-IN')}`;
    if (format === 'percent' && typeof val === 'number') return `${val.toFixed(1)}%`;
    return String(val);
  }
}
