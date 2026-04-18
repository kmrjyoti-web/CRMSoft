export declare class GetFollowingQuery {
    readonly userId: string;
    readonly tenantId: string;
    readonly page: number;
    readonly limit: number;
    constructor(userId: string, tenantId: string, page?: number, limit?: number);
}
