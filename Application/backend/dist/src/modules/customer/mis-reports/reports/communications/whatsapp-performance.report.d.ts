import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class WhatsAppPerformanceReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "WHATSAPP_PERFORMANCE";
    readonly name = "WhatsApp Performance";
    readonly category = "COMMUNICATION";
    readonly description = "Measures WhatsApp activity volume, quotation sends via WhatsApp, and per-user engagement metrics";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
