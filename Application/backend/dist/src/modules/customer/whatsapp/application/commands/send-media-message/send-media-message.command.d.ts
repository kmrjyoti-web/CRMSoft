export declare class SendMediaMessageCommand {
    readonly wabaId: string;
    readonly conversationId: string;
    readonly type: string;
    readonly mediaUrl: string;
    readonly caption: string | undefined;
    readonly userId: string;
    constructor(wabaId: string, conversationId: string, type: string, mediaUrl: string, caption: string | undefined, userId: string);
}
