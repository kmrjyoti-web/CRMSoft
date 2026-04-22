export class BulkTransferCommand {
  constructor(
    public readonly fromUserId: string,
    public readonly toUserId: string,
    public readonly transferredById: string,
    public readonly reason: string,
    public readonly reasonDetail?: string,
    public readonly entityType?: string,
  ) {}
}
