export class UpdateActivityCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly data: {
      subject?: string;
      description?: string;
      type?: string;
      scheduledAt?: Date;
      endTime?: Date;
      duration?: number;
      locationName?: string;
      latitude?: number;
      longitude?: number;
    },
  ) {}
}
