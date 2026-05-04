export class GetReassignmentPreviewQuery {
  constructor(
    public readonly fromUserId: string,
    public readonly toUserId?: string,
    public readonly entityType?: string,
  ) {}
}
