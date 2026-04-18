export declare class ListSavedFiltersQuery {
    readonly userId: string;
    readonly entityType?: string | undefined;
    readonly search?: string | undefined;
    readonly page: number;
    readonly limit: number;
    constructor(userId: string, entityType?: string | undefined, search?: string | undefined, page?: number, limit?: number);
}
