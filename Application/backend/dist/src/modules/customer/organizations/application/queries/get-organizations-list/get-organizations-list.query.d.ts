export declare class GetOrganizationsListQuery {
    readonly page: number;
    readonly limit: number;
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
    readonly search?: string | undefined;
    readonly city?: string | undefined;
    readonly industry?: string | undefined;
    readonly isActive?: boolean | undefined;
    constructor(page: number, limit: number, sortBy: string, sortOrder: 'asc' | 'desc', search?: string | undefined, city?: string | undefined, industry?: string | undefined, isActive?: boolean | undefined);
}
