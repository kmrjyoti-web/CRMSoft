export declare class GetReminderListQuery {
    readonly page: number;
    readonly limit: number;
    readonly recipientId?: string | undefined;
    readonly channel?: string | undefined;
    readonly isSent?: boolean | undefined;
    constructor(page?: number, limit?: number, recipientId?: string | undefined, channel?: string | undefined, isSent?: boolean | undefined);
}
