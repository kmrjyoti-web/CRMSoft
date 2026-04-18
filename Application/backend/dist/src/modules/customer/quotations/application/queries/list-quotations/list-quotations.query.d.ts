export declare class ListQuotationsQuery {
    readonly page?: number | undefined;
    readonly limit?: number | undefined;
    readonly sortBy?: string | undefined;
    readonly sortOrder?: "asc" | "desc" | undefined;
    readonly search?: string | undefined;
    readonly status?: string | undefined;
    readonly leadId?: string | undefined;
    readonly userId?: string | undefined;
    readonly dateFrom?: Date | undefined;
    readonly dateTo?: Date | undefined;
    constructor(page?: number | undefined, limit?: number | undefined, sortBy?: string | undefined, sortOrder?: "asc" | "desc" | undefined, search?: string | undefined, status?: string | undefined, leadId?: string | undefined, userId?: string | undefined, dateFrom?: Date | undefined, dateTo?: Date | undefined);
}
