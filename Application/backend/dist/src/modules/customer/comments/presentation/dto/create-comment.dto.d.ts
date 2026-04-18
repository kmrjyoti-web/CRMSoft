export declare class CreateCommentDto {
    entityType: string;
    entityId: string;
    content: string;
    visibility?: string;
    parentId?: string;
    taskId?: string;
    mentionedUserIds?: string[];
    attachments?: Record<string, unknown>[];
}
