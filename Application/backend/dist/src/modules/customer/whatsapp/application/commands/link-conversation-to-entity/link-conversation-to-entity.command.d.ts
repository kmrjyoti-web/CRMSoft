export declare class LinkConversationToEntityCommand {
    readonly conversationId: string;
    readonly entityType: string;
    readonly entityId: string;
    readonly userId: string;
    constructor(conversationId: string, entityType: string, entityId: string, userId: string);
}
