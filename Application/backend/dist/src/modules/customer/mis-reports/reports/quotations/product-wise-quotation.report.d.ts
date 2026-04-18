import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class ProductWiseQuotationReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "PRODUCT_WISE_QUOTATION";
    readonly name = "Product-wise Quotation Analysis";
    readonly category = "QUOTATION";
    readonly description = "Breaks down quotation performance by product including quote frequency, value, and acceptance rates";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = false;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
