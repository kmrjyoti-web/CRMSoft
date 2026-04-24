export class CreateActivityCommand {
  constructor(
    public readonly type: string,
    public readonly subject: string,
    public readonly userId: string,
    public readonly description?: string,
    public readonly scheduledAt?: Date,
    public readonly endTime?: Date,
    public readonly duration?: number,
    public readonly leadId?: string,
    public readonly contactId?: string,
    public readonly locationName?: string,
    public readonly latitude?: number,
    public readonly longitude?: number,
    public readonly reminderMinutesBefore?: number,
    public readonly taggedUserIds?: string[],
    public readonly tenantId?: string,
  ) {}
}
