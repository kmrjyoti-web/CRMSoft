export declare class GetConversationsQuery {
    readonly wabaId: string;
    readonly page: number;
    readonly limit: number;
    readonly status?: string | undefined;
    readonly assignedToId?: string | undefined;
    readonly search?: string | undefined;
    constructor(wabaId: string, page: number, limit: number, status?: string | undefined, assignedToId?: string | undefined, search?: string | undefined);
}
