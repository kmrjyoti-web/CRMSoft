export declare class GetCampaignRecipientsQuery {
    readonly campaignId: string;
    readonly page: number;
    readonly limit: number;
    readonly status?: string | undefined;
    constructor(campaignId: string, page: number, limit: number, status?: string | undefined);
}
