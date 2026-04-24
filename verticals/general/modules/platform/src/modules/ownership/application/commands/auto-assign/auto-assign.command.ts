export class AutoAssignCommand {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly triggerEvent: string,
    public readonly performedById?: string,
  ) {}
}
