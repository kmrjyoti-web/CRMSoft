import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class TourPlanComplianceReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "TOUR_PLAN_COMPLIANCE";
    readonly name = "Tour Plan Compliance";
    readonly category = "TOUR_PLAN";
    readonly description = "Tracks tour plan approval-to-completion rates and visit-level compliance per sales person";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
