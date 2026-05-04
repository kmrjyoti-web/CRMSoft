import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

export interface ResultSummary {
  jobId: string;
  fileName: string;
  totalRows: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  duplicateExact: number;
  duplicateFuzzy: number;
  duplicateInFile: number;
  successRate: number;
  reportUrl?: string;
  failedReportUrl?: string;
}

const STATUS_COLORS: Record<string, string> = {
  IMPORTED: '90EE90',   // green
  FAILED: 'FF6B6B',     // red
  SKIPPED: 'D3D3D3',    // gray
  DUPLICATE_EXACT: 'FFD700',  // gold
  DUPLICATE_FUZZY: 'FFA500',  // orange
  DUPLICATE_IN_FILE: 'DDA0DD', // plum
  VALID: 'ADD8E6',      // light blue
  INVALID: 'FFB6C1',    // light pink
};

@Injectable()
export class ResultReportService {
  constructor(private readonly prisma: PrismaService) {}

  /** Get result summary for a completed job */
  async getResultSummary(jobId: string): Promise<ResultSummary> {
    const job = await this.prisma.working.importJob.findUniqueOrThrow({ where: { id: jobId } });
    return {
      jobId: job.id,
      fileName: job.fileName,
      totalRows: job.totalRows,
      created: job.importedCount,
      updated: job.updatedCount,
      skipped: job.skippedRows,
      failed: job.failedCount,
      duplicateExact: job.duplicateExactRows,
      duplicateFuzzy: job.duplicateFuzzyRows,
      duplicateInFile: job.duplicateInFileRows,
      successRate: job.totalRows > 0
        ? Math.round(((job.importedCount + job.updatedCount) / job.totalRows) * 100)
        : 0,
      reportUrl: job.resultReportUrl || undefined,
      failedReportUrl: job.failedRowsReportUrl || undefined,
    };
  }

  /** Generate Excel report for import job results */
  async generateReport(jobId: string): Promise<{ fullPath: string; failedPath: string }> {
    const job = await this.prisma.working.importJob.findUniqueOrThrow({ where: { id: jobId } });
    const rows = await this.prisma.working.importRow.findMany({
      where: { importJobId: jobId },
      orderBy: { rowNumber: 'asc' },
    });

    const dir = path.join(process.cwd(), 'uploads', 'reports');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const fullPath = path.join(dir, `import-report-${jobId.slice(0, 8)}.xlsx`);
    const failedPath = path.join(dir, `import-failed-${jobId.slice(0, 8)}.xlsx`);

    // Full report
    await this.buildExcel(rows, job, fullPath, false);
    // Failed only report
    const failedRows = rows.filter(r => r.rowStatus === 'FAILED' || r.rowStatus === 'INVALID');
    if (failedRows.length > 0) {
      await this.buildExcel(failedRows, job, failedPath, true);
    }

    // Update job with report URLs
    await this.prisma.working.importJob.update({
      where: { id: jobId },
      data: {
        resultReportUrl: `/reports/import-report-${jobId.slice(0, 8)}.xlsx`,
        failedRowsReportUrl: failedRows.length > 0
          ? `/reports/import-failed-${jobId.slice(0, 8)}.xlsx`
          : null,
      },
    });

    return { fullPath, failedPath };
  }

  /** Build Excel workbook with colored rows */
  private async buildExcel(rows: any[], job: any, filePath: string, failedOnly: boolean): Promise<void> {
    const workbook = new ExcelJS.Workbook();

    // Summary sheet
    const summary = workbook.addWorksheet('Summary');
    summary.columns = [{ header: 'Metric', key: 'metric', width: 25 }, { header: 'Value', key: 'value', width: 20 }];
    summary.addRow({ metric: 'File Name', value: job.fileName });
    summary.addRow({ metric: 'Total Rows', value: job.totalRows });
    summary.addRow({ metric: 'Created', value: job.importedCount });
    summary.addRow({ metric: 'Updated', value: job.updatedCount });
    summary.addRow({ metric: 'Skipped', value: job.skippedRows });
    summary.addRow({ metric: 'Failed', value: job.failedCount });
    summary.addRow({ metric: 'Completed At', value: job.completedAt?.toISOString() || 'N/A' });
    this.styleHeaderRow(summary);

    // Data sheet
    const title = failedOnly ? 'Failed Rows' : 'All Rows';
    const sheet = workbook.addWorksheet(title);
    sheet.columns = [
      { header: 'Row #', key: 'rowNumber', width: 8 },
      { header: 'Status', key: 'status', width: 18 },
      { header: 'Action', key: 'action', width: 12 },
      { header: 'Raw Data', key: 'rawData', width: 50 },
      { header: 'Entity ID', key: 'entityId', width: 38 },
      { header: 'Error / Detail', key: 'error', width: 50 },
      { header: 'Match Score', key: 'matchScore', width: 12 },
    ];
    this.styleHeaderRow(sheet);

    for (const row of rows) {
      const dataRow = sheet.addRow({
        rowNumber: row.rowNumber,
        status: row.rowStatus,
        action: row.importAction || '-',
        rawData: JSON.stringify(row.rowData).slice(0, 200),
        entityId: row.importedEntityId || '-',
        error: row.importError || this.formatErrors(row.validationErrors),
        matchScore: row.fuzzyMatchScore ? Number(row.fuzzyMatchScore).toFixed(2) : '-',
      });

      const color = STATUS_COLORS[row.rowStatus] || 'FFFFFF';
      dataRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
      });
    }

    sheet.autoFilter = { from: 'A1', to: 'G1' };
    await workbook.xlsx.writeFile(filePath);
  }

  /** Style header row with blue background */
  private styleHeaderRow(sheet: ExcelJS.Worksheet): void {
    const row = sheet.getRow(1);
    row.font = { bold: true, color: { argb: 'FFFFFF' } };
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };
  }

  /** Format validation errors for display */
  private formatErrors(errors: any): string {
    if (!errors) return '-';
    if (Array.isArray(errors)) {
      return errors.map((e: any) => `${e.field}: ${e.message}`).join('; ');
    }
    return JSON.stringify(errors).slice(0, 200);
  }
}
