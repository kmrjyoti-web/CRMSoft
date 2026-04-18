export declare class GetUserActivityQuery {
    readonly userId: string;
    readonly page?: number | undefined;
    readonly limit?: number | undefined;
    readonly dateFrom?: Date | undefined;
    readonly dateTo?: Date | undefined;
    constructor(userId: string, page?: number | undefined, limit?: number | undefined, dateFrom?: Date | undefined, dateTo?: Date | undefined);
}
