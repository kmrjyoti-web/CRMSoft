export class TransferOwnerCommand {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly fromUserId: string,
    public readonly toUserId: string,
    public readonly ownerType: string,
    public readonly transferredById: string,
    public readonly reason: string,
    public readonly reasonDetail?: string,
  ) {}
}
