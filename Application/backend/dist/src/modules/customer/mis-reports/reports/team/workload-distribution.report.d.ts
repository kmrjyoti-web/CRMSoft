import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class WorkloadDistributionReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "WORKLOAD_DISTRIBUTION";
    readonly name = "Workload Distribution";
    readonly category = "TEAM";
    readonly description = "Visualizes active workload per team member with overload detection and rebalance suggestions";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = false;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
