export class CreateCommentCommand {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly content: string,
    public readonly authorId: string,
    public readonly authorRoleLevel: number,
    public readonly tenantId: string,
    public readonly visibility?: string,
    public readonly parentId?: string,
    public readonly taskId?: string,
    public readonly mentionedUserIds?: string[],
    public readonly attachments?: Record<string, unknown>[],
  ) {}
}
