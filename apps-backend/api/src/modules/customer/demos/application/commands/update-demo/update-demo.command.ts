export class UpdateDemoCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly data: {
      mode?: string;
      scheduledAt?: Date;
      duration?: number;
      meetingLink?: string;
      location?: string;
      notes?: string;
    },
  ) {}
}
