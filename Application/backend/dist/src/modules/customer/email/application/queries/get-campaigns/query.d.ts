export declare class GetCampaignsQuery {
    readonly userId: string;
    readonly page: number;
    readonly limit: number;
    readonly status?: string | undefined;
    constructor(userId: string, page: number, limit: number, status?: string | undefined);
}
