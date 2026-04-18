import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class DeadLostLeadsReport implements IReport {
    private readonly prisma;
    private readonly drillDownService;
    readonly code = "DEAD_LOST_LEADS";
    readonly name = "Dead & Lost Leads";
    readonly category = "LEAD";
    readonly description = "Analyses lost and stale on-hold leads with reason breakdown and recovery potential";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownService: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
