import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class NoShowAnalysisReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "NO_SHOW_ANALYSIS";
    readonly name = "No-Show Analysis";
    readonly category = "DEMO";
    readonly description = "Analyzes demo no-show patterns by day, time, and mode with actionable suggestions";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
