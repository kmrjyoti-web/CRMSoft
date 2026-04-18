export declare class ListRequirementsQuery {
    readonly tenantId: string;
    readonly page: number;
    readonly limit: number;
    readonly categoryId?: string | undefined;
    readonly authorId?: string | undefined;
    readonly search?: string | undefined;
    constructor(tenantId: string, page?: number, limit?: number, categoryId?: string | undefined, authorId?: string | undefined, search?: string | undefined);
}
