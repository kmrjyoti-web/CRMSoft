export class RevokeOwnerCommand {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly userId: string,
    public readonly ownerType: string,
    public readonly revokedById: string,
    public readonly reason: string,
  ) {}
}
