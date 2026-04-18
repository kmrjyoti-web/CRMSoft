export declare class GetRawContactsListQuery {
    readonly page: number;
    readonly limit: number;
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
    readonly search?: string | undefined;
    readonly isActive?: boolean | undefined;
    readonly status?: string | undefined;
    readonly source?: string | undefined;
    readonly companyName?: string | undefined;
    readonly firstName?: string | undefined;
    readonly lastName?: string | undefined;
    readonly createdAtFrom?: string | undefined;
    readonly createdAtTo?: string | undefined;
    constructor(page: number, limit: number, sortBy: string, sortOrder: 'asc' | 'desc', search?: string | undefined, isActive?: boolean | undefined, status?: string | undefined, source?: string | undefined, companyName?: string | undefined, firstName?: string | undefined, lastName?: string | undefined, createdAtFrom?: string | undefined, createdAtTo?: string | undefined);
}
