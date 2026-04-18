export declare class GetEmailsQuery {
    readonly page: number;
    readonly limit: number;
    readonly accountId?: string | undefined;
    readonly direction?: string | undefined;
    readonly status?: string | undefined;
    readonly isStarred?: boolean | undefined;
    readonly isRead?: boolean | undefined;
    constructor(page: number, limit: number, accountId?: string | undefined, direction?: string | undefined, status?: string | undefined, isStarred?: boolean | undefined, isRead?: boolean | undefined);
}
