import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class ContactCompletenessReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "CONTACT_COMPLETENESS";
    readonly name = "Contact Completeness";
    readonly category = "CONTACT_ORG";
    readonly description = "Scores each contact on data completeness and groups them into quality tiers";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = false;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
    private getTier;
}
