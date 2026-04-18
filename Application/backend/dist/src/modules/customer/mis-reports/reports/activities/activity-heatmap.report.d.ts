import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData } from '../../interfaces/report.interface';
export declare class ActivityHeatmapReport implements IReport {
    private readonly prisma;
    readonly code = "ACTIVITY_HEATMAP";
    readonly name = "Activity Heatmap";
    readonly category = "ACTIVITY";
    readonly description = "Visualizes activity patterns in a day-of-week by hour-of-day heatmap to identify peak engagement times";
    readonly supportsDrillDown = false;
    readonly supportsPeriodComparison = false;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService);
    generate(params: ReportParams): Promise<ReportData>;
}
