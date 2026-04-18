import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class MonthlyBusinessReviewReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "MONTHLY_BUSINESS_REVIEW";
    readonly name = "Monthly Business Review";
    readonly category = "EXECUTIVE";
    readonly description = "Comprehensive monthly business review covering revenue, pipeline, leads, team performance, activity, and quotations";
    readonly supportsDrillDown = false;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
}
