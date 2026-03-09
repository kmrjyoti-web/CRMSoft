export class BulkAssignTaskCommand {
  constructor(
    public readonly taskIds: string[],
    public readonly assignedToId: string,
    public readonly userId: string,
    public readonly roleLevel: number,
    public readonly tenantId: string,
  ) {}
}
