import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class CustomReportReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "CUSTOM_REPORT";
    readonly name = "Custom Report";
    readonly category = "CUSTOM";
    readonly description = "Dynamic report builder allowing flexible entity selection, column picking, filtering, grouping, and aggregation";
    readonly supportsDrillDown = false;
    readonly supportsPeriodComparison = false;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    private emptyReport;
}
