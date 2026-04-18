import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class QuotationAgingReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "QUOTATION_AGING";
    readonly name = "Quotation Aging Report";
    readonly category = "QUOTATION";
    readonly description = "Tracks pending quotations by age buckets with recommended actions and expiry alerts";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = false;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
