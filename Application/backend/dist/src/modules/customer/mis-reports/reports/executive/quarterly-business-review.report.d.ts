import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class QuarterlyBusinessReviewReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "QUARTERLY_BUSINESS_REVIEW";
    readonly name = "Quarterly Business Review";
    readonly category = "EXECUTIVE";
    readonly description = "Comprehensive quarterly review with YoY comparison, target achievements, revenue, pipeline, and team analysis";
    readonly supportsDrillDown = false;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
}
