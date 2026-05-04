export class CreateReminderCommand {
  constructor(
    public readonly title: string,
    public readonly scheduledAt: Date,
    public readonly recipientId: string,
    public readonly createdById: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly channel?: string,
    public readonly message?: string,
  ) {}
}
