import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
import { CrossDbResolverService } from '../../../../../core/prisma/cross-db-resolver.service';
export declare class LeadFunnelReport implements IReport {
    private readonly prisma;
    private readonly drillDownService;
    private readonly resolver;
    readonly code = "LEAD_FUNNEL";
    readonly name = "Lead Funnel Analysis";
    readonly category = "LEAD";
    readonly description = "Visualises the lead pipeline as a funnel with stage counts and drop-off percentages";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownService: DrillDownService, resolver: CrossDbResolverService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
