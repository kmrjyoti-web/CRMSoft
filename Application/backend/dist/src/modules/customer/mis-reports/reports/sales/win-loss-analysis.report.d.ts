import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
import { CrossDbResolverService } from '../../../../../core/prisma/cross-db-resolver.service';
export declare class WinLossAnalysisReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    private readonly resolver;
    readonly code = "WIN_LOSS_ANALYSIS";
    readonly name = "Win/Loss Analysis";
    readonly category = "SALES";
    readonly description = "Detailed analysis of won vs lost deals by source, user, and lost reason";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService, resolver: CrossDbResolverService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
