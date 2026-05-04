export class CreateFollowUpCommand {
  constructor(
    public readonly title: string,
    public readonly dueDate: Date,
    public readonly assignedToId: string,
    public readonly createdById: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly description?: string,
    public readonly priority?: string,
  ) {}
}
