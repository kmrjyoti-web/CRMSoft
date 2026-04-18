import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class OrgWiseRevenueReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "ORG_WISE_REVENUE";
    readonly name = "Organization-Wise Revenue";
    readonly category = "CONTACT_ORG";
    readonly description = "Revenue analysis per organization including deal counts, lifetime value, and Pareto distribution";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
