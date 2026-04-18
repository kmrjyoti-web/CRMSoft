import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class EmailPerformanceReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "EMAIL_PERFORMANCE";
    readonly name = "Email Performance";
    readonly category = "COMMUNICATION";
    readonly description = "Tracks email activity volume, per-user email metrics, and lead touch rates via email channel";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
