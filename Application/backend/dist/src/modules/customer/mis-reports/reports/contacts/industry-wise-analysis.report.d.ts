import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class IndustryWiseAnalysisReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "INDUSTRY_WISE_ANALYSIS";
    readonly name = "Industry-Wise Analysis";
    readonly category = "CONTACT_ORG";
    readonly description = "Analyzes lead performance, conversion rates, and revenue grouped by organization industry";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
