export declare class GetLeaderboardQuery {
    readonly dateFrom: Date;
    readonly dateTo: Date;
    readonly metric: string;
    readonly limit?: number | undefined;
    readonly currentUserId?: string | undefined;
    constructor(dateFrom: Date, dateTo: Date, metric: string, limit?: number | undefined, currentUserId?: string | undefined);
}
