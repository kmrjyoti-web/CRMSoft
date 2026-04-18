import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class LeadAllocationReport implements IReport {
    private readonly prisma;
    private readonly drillDownService;
    readonly code = "LEAD_ALLOCATION";
    readonly name = "Lead Allocation Report";
    readonly category = "LEAD";
    readonly description = "Analyses lead distribution across team members with performance and workload metrics";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownService: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
