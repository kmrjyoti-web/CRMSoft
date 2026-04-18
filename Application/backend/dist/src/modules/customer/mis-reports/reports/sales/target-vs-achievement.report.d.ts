import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class TargetVsAchievementReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "TARGET_VS_ACHIEVEMENT";
    readonly name = "Target vs Achievement";
    readonly category = "SALES";
    readonly description = "Compare sales targets against actual achievements with projected outcomes";
    readonly supportsDrillDown = false;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
}
