import { ReportMetric } from '../interfaces/report.interface';
export interface ComparisonPeriod {
    from: Date;
    to: Date;
}
export declare class PeriodComparatorService {
    getComparisonPeriod(dateFrom: Date, dateTo: Date): ComparisonPeriod;
    compare(current: ReportMetric[], previous: ReportMetric[]): ReportMetric[];
    private calculateChangePercent;
    private getDirection;
}
