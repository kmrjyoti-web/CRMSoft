import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class DailyDigestReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "MIS_DAILY_DIGEST";
    readonly name = "Daily Digest";
    readonly category = "EXECUTIVE";
    readonly description = "Daily summary with yesterday results, today schedule, week-to-date and month-to-date progress, and alerts";
    readonly supportsDrillDown = false;
    readonly supportsPeriodComparison = false;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
}
