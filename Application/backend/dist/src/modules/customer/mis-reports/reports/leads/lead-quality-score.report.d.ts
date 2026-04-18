import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class LeadQualityScoreReport implements IReport {
    private readonly prisma;
    private readonly drillDownService;
    readonly code = "LEAD_QUALITY_SCORE";
    readonly name = "Lead Quality Score";
    readonly category = "LEAD";
    readonly description = "Scores each lead on a 0-100 scale based on completeness, engagement, and progression indicators";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = false;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownService: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
