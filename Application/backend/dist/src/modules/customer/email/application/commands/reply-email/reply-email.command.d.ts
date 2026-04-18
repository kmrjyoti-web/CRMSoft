export declare class ReplyEmailCommand {
    readonly originalEmailId: string;
    readonly userId: string;
    readonly replyType: 'REPLY' | 'REPLY_ALL' | 'FORWARD';
    readonly bodyHtml: string;
    readonly to?: {
        email: string;
        name?: string;
    }[] | undefined;
    readonly bodyText?: string | undefined;
    constructor(originalEmailId: string, userId: string, replyType: 'REPLY' | 'REPLY_ALL' | 'FORWARD', bodyHtml: string, to?: {
        email: string;
        name?: string;
    }[] | undefined, bodyText?: string | undefined);
}
