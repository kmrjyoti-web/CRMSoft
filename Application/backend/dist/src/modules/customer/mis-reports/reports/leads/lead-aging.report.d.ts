import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class LeadAgingReport implements IReport {
    private readonly prisma;
    private readonly drillDownService;
    readonly code = "LEAD_AGING";
    readonly name = "Lead Aging Report";
    readonly category = "LEAD";
    readonly description = "Analyses active leads by age buckets to identify stale or ageing pipeline items";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = false;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownService: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
