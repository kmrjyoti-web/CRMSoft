export class AssignOwnerCommand {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly userId: string,
    public readonly ownerType: string,
    public readonly assignedById: string,
    public readonly reason: string,
    public readonly reasonDetail?: string,
    public readonly method?: string,
    public readonly validFrom?: Date,
    public readonly validTo?: Date,
  ) {}
}
