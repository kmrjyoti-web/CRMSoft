export declare class GetEntityConversationsQuery {
    readonly entityType: string;
    readonly entityId: string;
    readonly page: number;
    readonly limit: number;
    constructor(entityType: string, entityId: string, page: number, limit: number);
}
