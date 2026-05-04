export class CreateDemoCommand {
  constructor(
    public readonly leadId: string,
    public readonly userId: string,
    public readonly mode: string,
    public readonly scheduledAt: Date,
    public readonly duration?: number,
    public readonly meetingLink?: string,
    public readonly location?: string,
    public readonly notes?: string,
  ) {}
}
