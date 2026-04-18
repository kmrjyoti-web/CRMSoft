export declare class CreateCommentCommand {
    readonly entityType: string;
    readonly entityId: string;
    readonly content: string;
    readonly authorId: string;
    readonly authorRoleLevel: number;
    readonly tenantId: string;
    readonly visibility?: string | undefined;
    readonly parentId?: string | undefined;
    readonly taskId?: string | undefined;
    readonly mentionedUserIds?: string[] | undefined;
    readonly attachments?: Record<string, unknown>[] | undefined;
    constructor(entityType: string, entityId: string, content: string, authorId: string, authorRoleLevel: number, tenantId: string, visibility?: string | undefined, parentId?: string | undefined, taskId?: string | undefined, mentionedUserIds?: string[] | undefined, attachments?: Record<string, unknown>[] | undefined);
}
