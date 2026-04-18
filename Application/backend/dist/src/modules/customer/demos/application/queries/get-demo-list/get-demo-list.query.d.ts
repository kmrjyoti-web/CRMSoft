export declare class GetDemoListQuery {
    readonly page: number;
    readonly limit: number;
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
    readonly search?: string | undefined;
    readonly status?: string | undefined;
    readonly mode?: string | undefined;
    readonly conductedById?: string | undefined;
    readonly fromDate?: string | undefined;
    readonly toDate?: string | undefined;
    constructor(page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc', search?: string | undefined, status?: string | undefined, mode?: string | undefined, conductedById?: string | undefined, fromDate?: string | undefined, toDate?: string | undefined);
}
