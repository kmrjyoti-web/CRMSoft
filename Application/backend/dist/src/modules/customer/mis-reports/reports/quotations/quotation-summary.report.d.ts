import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
import { CrossDbResolverService } from '../../../../../core/prisma/cross-db-resolver.service';
export declare class QuotationSummaryReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    private readonly resolver;
    readonly code = "QUOTATION_SUMMARY";
    readonly name = "Quotation Summary";
    readonly category = "QUOTATION";
    readonly description = "Overall quotation KPIs including volume, value, acceptance rates, and response times";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService, resolver: CrossDbResolverService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
