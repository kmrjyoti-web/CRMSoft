export declare class ListTenantsQuery {
    readonly page: number;
    readonly limit: number;
    readonly status?: string | undefined;
    readonly search?: string | undefined;
    constructor(page: number, limit: number, status?: string | undefined, search?: string | undefined);
}
