import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class DemoSummaryReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "DEMO_SUMMARY";
    readonly name = "Demo Summary";
    readonly category = "DEMO";
    readonly description = "Comprehensive overview of demo activities by status, mode, and user with monthly trends";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
