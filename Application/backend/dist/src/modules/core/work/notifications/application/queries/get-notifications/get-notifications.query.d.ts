export declare class GetNotificationsQuery {
    readonly userId: string;
    readonly page?: number | undefined;
    readonly limit?: number | undefined;
    readonly category?: string | undefined;
    readonly status?: string | undefined;
    readonly priority?: string | undefined;
    constructor(userId: string, page?: number | undefined, limit?: number | undefined, category?: string | undefined, status?: string | undefined, priority?: string | undefined);
}
