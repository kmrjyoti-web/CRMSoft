export declare class CustomReportDto {
    entity: string;
    dateFrom: string;
    dateTo: string;
    columns?: string[];
    entityFilters?: Record<string, any>;
    groupByField?: string;
    aggregations?: Array<{
        column: string;
        function: string;
    }>;
    sortByField?: string;
    sortDirection?: 'asc' | 'desc';
    chartType?: string;
    page?: number;
    limit?: number;
}
export declare class SaveCustomReportDto {
    name: string;
    entity: string;
    columns?: string[];
    entityFilters?: Record<string, any>;
    groupByField?: string;
    aggregations?: Array<{
        column: string;
        function: string;
    }>;
    sortByField?: string;
    sortDirection?: 'asc' | 'desc';
    chartType?: string;
    isPinned?: boolean;
}
