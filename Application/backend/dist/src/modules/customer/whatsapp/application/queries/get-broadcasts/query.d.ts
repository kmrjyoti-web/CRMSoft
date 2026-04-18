export declare class GetBroadcastsQuery {
    readonly wabaId: string;
    readonly page: number;
    readonly limit: number;
    readonly status?: string | undefined;
    constructor(wabaId: string, page: number, limit: number, status?: string | undefined);
}
