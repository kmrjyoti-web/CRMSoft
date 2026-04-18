import { PrismaService } from '../../../../core/prisma/prisma.service';
import { IReport } from '../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult, ExportResult } from '../interfaces/report.interface';
import { PeriodComparatorService } from './period-comparator.service';
import { ReportRendererExcelService } from './report-renderer-excel.service';
import { ReportRendererCsvService } from './report-renderer-csv.service';
import { ReportRendererPdfService } from './report-renderer-pdf.service';
export interface ReportDefinitionMeta {
    code: string;
    name: string;
    category: string;
    description: string;
    availableFilters: any[];
    supportsDrillDown: boolean;
    supportsPeriodComparison: boolean;
}
export declare class ReportEngineService {
    private readonly prisma;
    private readonly comparator;
    private readonly excelRenderer;
    private readonly csvRenderer;
    private readonly pdfRenderer;
    private readonly logger;
    private readonly registry;
    private readonly exportDir;
    constructor(prisma: PrismaService, comparator: PeriodComparatorService, excelRenderer: ReportRendererExcelService, csvRenderer: ReportRendererCsvService, pdfRenderer: ReportRendererPdfService);
    registerReport(report: IReport): void;
    getDefinitions(category?: string): ReportDefinitionMeta[];
    getDefinition(code: string): ReportDefinitionMeta;
    private toMeta;
    generate(code: string, params: ReportParams): Promise<ReportData>;
    export(code: string, params: ReportParams, format: string, userId: string, userName: string, source?: string): Promise<ExportResult>;
    drillDown(code: string, drillParams: DrillDownParams): Promise<DrillDownResult>;
    private getRenderer;
}
