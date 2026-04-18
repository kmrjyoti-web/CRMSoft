import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class RevisionHistoryReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "REVISION_HISTORY";
    readonly name = "Revision History Analysis";
    readonly category = "QUOTATION";
    readonly description = "Analyses quotation revision patterns, discount progression, and outcome correlation with revision counts";
    readonly supportsDrillDown = false;
    readonly supportsPeriodComparison = false;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
}
