import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class CampaignReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "CAMPAIGN_REPORT";
    readonly name = "Campaign Report";
    readonly category = "COMMUNICATION";
    readonly description = "Analyzes batch quotation sends grouped by date and user as campaigns, with channel breakdown and view rates";
    readonly supportsDrillDown = false;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
}
