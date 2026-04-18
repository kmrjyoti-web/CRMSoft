export declare class GenerateReportDto {
    dateFrom: string;
    dateTo: string;
    userId?: string;
    groupBy?: string;
    filters?: Record<string, any>;
    comparePrevious?: boolean;
}
