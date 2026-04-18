import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class SalesForecastReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "SALES_FORECAST";
    readonly name = "Sales Forecast";
    readonly category = "SALES";
    readonly description = "Pipeline-weighted revenue forecast with optimistic, realistic, and pessimistic scenarios";
    readonly supportsDrillDown = false;
    readonly supportsPeriodComparison = false;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
}
