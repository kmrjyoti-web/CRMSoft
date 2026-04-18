import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData } from '../../interfaces/report.interface';
export declare class DemoCalendarReport implements IReport {
    private readonly prisma;
    readonly code = "DEMO_CALENDAR";
    readonly name = "Demo Calendar";
    readonly category = "DEMO";
    readonly description = "Daily demo schedule view with per-user load distribution and capacity insights";
    readonly supportsDrillDown = false;
    readonly supportsPeriodComparison = false;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService);
    generate(params: ReportParams): Promise<ReportData>;
}
