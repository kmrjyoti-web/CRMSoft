export declare class GetRecurrenceListQuery {
    readonly page: number;
    readonly limit: number;
    readonly createdById?: string | undefined;
    readonly pattern?: string | undefined;
    readonly isActive?: boolean | undefined;
    constructor(page?: number, limit?: number, createdById?: string | undefined, pattern?: string | undefined, isActive?: boolean | undefined);
}
