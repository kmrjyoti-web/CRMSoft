import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class FollowUpComplianceReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "FOLLOW_UP_COMPLIANCE";
    readonly name = "Follow-Up Compliance";
    readonly category = "ACTIVITY";
    readonly description = "Measures follow-up completion rates and identifies overdue activities per user";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
