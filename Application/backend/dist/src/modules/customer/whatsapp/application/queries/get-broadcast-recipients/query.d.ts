export declare class GetBroadcastRecipientsQuery {
    readonly broadcastId: string;
    readonly page: number;
    readonly limit: number;
    readonly status?: string | undefined;
    constructor(broadcastId: string, page: number, limit: number, status?: string | undefined);
}
