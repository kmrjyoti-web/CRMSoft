import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class QuotationVsOrderReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "QUOTATION_VS_ORDER";
    readonly name = "Quotation vs Order";
    readonly category = "QUOTATION";
    readonly description = "Compares quoted amounts against won deal values, highlighting discount patterns and revision impact";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
