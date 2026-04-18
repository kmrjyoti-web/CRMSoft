export declare class GetTeamPerformanceQuery {
    readonly dateFrom: Date;
    readonly dateTo: Date;
    readonly roleId?: string | undefined;
    constructor(dateFrom: Date, dateTo: Date, roleId?: string | undefined);
}
