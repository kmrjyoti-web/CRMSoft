export class BulkAssignCommand {
  constructor(
    public readonly entityType: string,
    public readonly entityIds: string[],
    public readonly userId: string,
    public readonly ownerType: string,
    public readonly reason: string,
    public readonly assignedById: string,
  ) {}
}
