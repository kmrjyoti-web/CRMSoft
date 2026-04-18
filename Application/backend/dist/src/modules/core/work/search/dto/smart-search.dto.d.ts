export declare class SearchFilterDto {
    parameter: string;
    value: string;
    pattern: 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'EXACT';
}
export declare class SmartSearchDto {
    entityType: string;
    filters: SearchFilterDto[];
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
