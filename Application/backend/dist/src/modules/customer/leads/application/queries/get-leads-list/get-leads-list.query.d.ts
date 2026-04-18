export declare class GetLeadsListQuery {
    readonly page: number;
    readonly limit: number;
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
    readonly search?: string | undefined;
    readonly isActive?: boolean | undefined;
    readonly status?: string | undefined;
    readonly priority?: string | undefined;
    readonly allocatedToId?: string | undefined;
    readonly contactId?: string | undefined;
    readonly organizationId?: string | undefined;
    constructor(page: number, limit: number, sortBy: string, sortOrder: 'asc' | 'desc', search?: string | undefined, isActive?: boolean | undefined, status?: string | undefined, priority?: string | undefined, allocatedToId?: string | undefined, contactId?: string | undefined, organizationId?: string | undefined);
}
