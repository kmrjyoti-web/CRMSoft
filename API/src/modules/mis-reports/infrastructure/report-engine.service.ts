import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { IReport } from '../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult, ExportResult } from '../interfaces/report.interface';
import { PeriodComparatorService } from './period-comparator.service';
import { ReportRendererExcelService } from './report-renderer-excel.service';
import { ReportRendererCsvService } from './report-renderer-csv.service';
import { ReportRendererPdfService } from './report-renderer-pdf.service';

/** Metadata returned when listing available reports */
export interface ReportDefinitionMeta {
  code: string; name: string; category: string; description: string;
  availableFilters: any[]; supportsDrillDown: boolean; supportsPeriodComparison: boolean;
}

/**
 * Central report engine that manages a registry of IReport implementations,
 * coordinates generation, period comparison, export, and drill-down.
 */
@Injectable()
export class ReportEngineService {
  private readonly logger = new Logger(ReportEngineService.name);
  private readonly registry = new Map<string, IReport>();
  private readonly exportDir = path.join(process.cwd(), 'tmp', 'mis-reports');

  constructor(
    private readonly prisma: PrismaService,
    private readonly comparator: PeriodComparatorService,
    private readonly excelRenderer: ReportRendererExcelService,
    private readonly csvRenderer: ReportRendererCsvService,
    private readonly pdfRenderer: ReportRendererPdfService,
  ) {
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  /**
   * Register an IReport implementation in the engine.
   * @param report - Report instance implementing IReport
   */
  registerReport(report: IReport): void {
    this.registry.set(report.code, report);
    this.logger.log(`Registered report: ${report.code} (${report.name})`);
  }

  /**
   * Get metadata for all registered reports, optionally filtered by category.
   * @param category - Optional category filter (e.g., "SALES", "LEAD")
   * @returns Array of report definition metadata
   */
  getDefinitions(category?: string): ReportDefinitionMeta[] {
    const defs: ReportDefinitionMeta[] = [];
    for (const r of this.registry.values()) {
      if (category && r.category !== category) continue;
      defs.push(this.toMeta(r));
    }
    return defs;
  }

  /**
   * Get metadata for a single registered report by code.
   * @param code - Unique report code
   * @returns Report definition metadata
   * @throws NotFoundException if report code is not registered
   */
  getDefinition(code: string): ReportDefinitionMeta {
    const report = this.registry.get(code);
    if (!report) throw new NotFoundException(`Report "${code}" not found`);
    return this.toMeta(report);
  }

  /** Convert an IReport to its metadata representation */
  private toMeta(r: IReport): ReportDefinitionMeta {
    return {
      code: r.code, name: r.name, category: r.category, description: r.description,
      availableFilters: r.availableFilters, supportsDrillDown: r.supportsDrillDown,
      supportsPeriodComparison: r.supportsPeriodComparison,
    };
  }

  /**
   * Generate a report by code. Optionally runs period comparison.
   * @param code - Unique report code
   * @param params - Report generation parameters
   * @returns Complete report data with optional comparison
   * @throws NotFoundException if report code is not registered
   */
  async generate(code: string, params: ReportParams): Promise<ReportData> {
    const report = this.registry.get(code);
    if (!report) throw new NotFoundException(`Report "${code}" not found`);

    const data = await report.generate(params);

    if (params.comparePrevious && report.supportsPeriodComparison) {
      const prevPeriod = this.comparator.getComparisonPeriod(params.dateFrom, params.dateTo);
      const prevData = await report.generate({
        ...params,
        dateFrom: prevPeriod.from,
        dateTo: prevPeriod.to,
        comparePrevious: false,
      });
      data.comparison = {
        metrics: this.comparator.compare(data.summary, prevData.summary),
      };
    }

    return data;
  }

  /**
   * Generate and export a report to a file (XLSX, CSV, or PDF).
   * Creates a ReportExportLog entry in the database.
   * @param code - Unique report code
   * @param params - Report generation parameters
   * @param format - Export format: "XLSX", "CSV", or "PDF"
   * @param userId - ID of the user requesting the export
   * @param userName - Display name of the user
   * @param source - Export source: "MANUAL" or "SCHEDULED"
   * @returns Export result with file path, size, and timing
   */
  async export(
    code: string,
    params: ReportParams,
    format: string,
    userId: string,
    userName: string,
    source: string = 'MANUAL',
  ): Promise<ExportResult> {
    const startTime = Date.now();
    const data = await this.generate(code, params);
    const renderer = this.getRenderer(format);
    const buffer = await renderer.render(data);

    const fileName = `${code}_${Date.now()}.${format.toLowerCase()}`;
    const filePath = path.join(this.exportDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const generationTimeMs = Date.now() - startTime;
    const recordCount = data.tables.reduce((sum, t) => sum + t.rows.length, 0);

    await this.prisma.reportExportLog.create({
      data: {
        reportType: 'CUSTOM' as any,
        reportCode: code,
        reportName: data.reportName,
        format: format as any,
        filters: params as any,
        recordCount,
        fileUrl: filePath,
        fileSize: buffer.length,
        status: 'COMPLETED',
        generatedAt: new Date(),
        duration: generationTimeMs,
        generationTimeMs,
        exportedById: userId,
        exportedByName: userName,
        exportSource: source,
      },
    });

    return { fileUrl: filePath, fileName, fileSize: buffer.length, recordCount, generationTimeMs };
  }

  /**
   * Drill down into a specific dimension of a report.
   * @param code - Unique report code
   * @param drillParams - Drill-down parameters
   * @returns Paginated drill-down result
   * @throws NotFoundException if report not found or drill-down not supported
   */
  async drillDown(code: string, drillParams: DrillDownParams): Promise<DrillDownResult> {
    const report = this.registry.get(code);
    if (!report) throw new NotFoundException(`Report "${code}" not found`);
    if (!report.supportsDrillDown || !report.drillDown) {
      throw new NotFoundException(`Report "${code}" does not support drill-down`);
    }
    return report.drillDown(drillParams);
  }

  /**
   * Select the appropriate renderer based on format string.
   * @param format - File format: "XLSX", "CSV", or "PDF"
   * @returns The matching renderer instance
   */
  private getRenderer(format: string) {
    switch (format.toUpperCase()) {
      case 'XLSX': return this.excelRenderer;
      case 'CSV': return this.csvRenderer;
      case 'PDF': return this.pdfRenderer;
      default: return this.excelRenderer;
    }
  }
}
