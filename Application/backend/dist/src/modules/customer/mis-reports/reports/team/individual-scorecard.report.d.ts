import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class IndividualScorecardReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "INDIVIDUAL_SCORECARD";
    readonly name = "Individual Scorecard";
    readonly category = "TEAM";
    readonly description = "Comprehensive per-employee scorecard covering leads, activities, demos, quotations, revenue, and efficiency";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
