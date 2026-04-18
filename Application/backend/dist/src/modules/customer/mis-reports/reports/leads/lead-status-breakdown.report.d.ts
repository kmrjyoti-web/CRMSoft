import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class LeadStatusBreakdownReport implements IReport {
    private readonly prisma;
    private readonly drillDownService;
    readonly code = "LEAD_STATUS_BREAKDOWN";
    readonly name = "Lead Status Breakdown";
    readonly category = "LEAD";
    readonly description = "Snapshot of leads grouped by current status with count and value distribution";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownService: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
