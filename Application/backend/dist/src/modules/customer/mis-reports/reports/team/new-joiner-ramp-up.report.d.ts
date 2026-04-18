import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData } from '../../interfaces/report.interface';
export declare class NewJoinerRampUpReport implements IReport {
    private readonly prisma;
    readonly code = "NEW_JOINER_RAMP_UP";
    readonly name = "New Joiner Ramp-Up";
    readonly category = "TEAM";
    readonly description = "Tracks new joiners week-by-week ramp-up in activities, deals, and revenue compared to team averages";
    readonly supportsDrillDown = false;
    readonly supportsPeriodComparison = false;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService);
    generate(params: ReportParams): Promise<ReportData>;
}
