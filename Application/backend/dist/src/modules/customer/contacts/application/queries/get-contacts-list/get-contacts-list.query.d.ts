export declare class GetContactsListQuery {
    readonly page: number;
    readonly limit: number;
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
    readonly search?: string | undefined;
    readonly isActive?: boolean | undefined;
    readonly designation?: string | undefined;
    readonly department?: string | undefined;
    readonly organizationId?: string | undefined;
    constructor(page: number, limit: number, sortBy: string, sortOrder: 'asc' | 'desc', search?: string | undefined, isActive?: boolean | undefined, designation?: string | undefined, department?: string | undefined, organizationId?: string | undefined);
}
