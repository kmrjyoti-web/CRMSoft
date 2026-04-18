import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class VisitOutcomeReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "VISIT_OUTCOME";
    readonly name = "Visit Outcome Analysis";
    readonly category = "TOUR_PLAN";
    readonly description = "Analyzes tour plan visit outcomes, productive visit rates, and average time spent per visit";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = false;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
