import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData } from '../../interfaces/report.interface';
export declare class DuplicateContactsReport implements IReport {
    private readonly prisma;
    readonly code = "DUPLICATE_CONTACTS";
    readonly name = "Duplicate Contacts";
    readonly category = "CONTACT_ORG";
    readonly description = "Identifies potential duplicate contacts by name matching and groups them by severity";
    readonly supportsDrillDown = false;
    readonly supportsPeriodComparison = false;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService);
    generate(params: ReportParams): Promise<ReportData>;
    private classifySeverity;
}
