export declare class SearchAuditDto {
    q?: string;
    entityType?: string;
    action?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    field?: string;
    module?: string;
    sensitive?: boolean;
    page?: number;
    limit?: number;
}
