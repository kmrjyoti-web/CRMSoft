export declare class GetActivityListQuery {
    readonly page: number;
    readonly limit: number;
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
    readonly search?: string | undefined;
    readonly isActive?: boolean | undefined;
    readonly type?: string | undefined;
    readonly leadId?: string | undefined;
    readonly contactId?: string | undefined;
    readonly createdById?: string | undefined;
    readonly fromDate?: string | undefined;
    readonly toDate?: string | undefined;
    constructor(page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc', search?: string | undefined, isActive?: boolean | undefined, type?: string | undefined, leadId?: string | undefined, contactId?: string | undefined, createdById?: string | undefined, fromDate?: string | undefined, toDate?: string | undefined);
}
