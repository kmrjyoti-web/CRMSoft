import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class CeoDashboardReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "CEO_DASHBOARD";
    readonly name = "CEO Dashboard";
    readonly category = "EXECUTIVE";
    readonly description = "High-level executive dashboard with 10 KPI cards, 7-day trends, top deals, and quick alerts";
    readonly supportsDrillDown = false;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
}
