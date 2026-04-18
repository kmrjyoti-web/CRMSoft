import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { IReport, FilterDefinition } from '../../interfaces/report-class.interface';
import { ReportParams, ReportData, DrillDownParams, DrillDownResult } from '../../interfaces/report.interface';
import { DrillDownService } from '../../infrastructure/drill-down.service';
export declare class VisitToConversionReport implements IReport {
    private readonly prisma;
    private readonly drillDownSvc;
    readonly code = "VISIT_TO_CONVERSION";
    readonly name = "Visit to Conversion";
    readonly category = "TOUR_PLAN";
    readonly description = "Measures field visit effectiveness by tracking conversion from visit to demo, quotation, and won stages";
    readonly supportsDrillDown = true;
    readonly supportsPeriodComparison = true;
    readonly availableFilters: FilterDefinition[];
    constructor(prisma: PrismaService, drillDownSvc: DrillDownService);
    generate(params: ReportParams): Promise<ReportData>;
    drillDown(params: DrillDownParams): Promise<DrillDownResult>;
}
