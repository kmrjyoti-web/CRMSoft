import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
import { CrossDbResolverService } from '../../../../../core/prisma/cross-db-resolver.service';
export declare class LeadSourceAnalysisReport implements IReport {
    private readonly prisma;
    private readonly drillDownService;
    private readonly resolver;
    readonly code = "LEAD_SOURCE_ANALYSIS";
    readonly name = "Lead Source Analysis";
    readonly category = "LEAD";
    readonly description = "Analyses lead generation effectiveness across different sources with conversion and revenue metrics";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownService: DrillDownService, resolver: CrossDbResolverService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
