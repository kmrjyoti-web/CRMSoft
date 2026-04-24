export class ScheduleEmailCommand {
  constructor(
    public readonly emailId: string,
    public readonly scheduledAt: Date,
    public readonly userId: string,
  ) {}
}
