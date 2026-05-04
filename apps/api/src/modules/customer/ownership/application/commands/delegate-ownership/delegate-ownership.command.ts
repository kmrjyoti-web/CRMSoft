export class DelegateOwnershipCommand {
  constructor(
    public readonly fromUserId: string,
    public readonly toUserId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly reason: string,
    public readonly delegatedById: string,
    public readonly entityType?: string,
  ) {}
}
