import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class FieldTeamTrackerReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "FIELD_TEAM_TRACKER";
    readonly name = "Field Team Tracker";
    readonly category = "TOUR_PLAN";
    readonly description = "Tracks field team activity including visits per user, organizations covered, and geographic reach";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
