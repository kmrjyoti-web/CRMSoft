export class CreateTourPlanCommand {
  constructor(
    public readonly title: string,
    public readonly planDate: Date,
    public readonly userId: string,
    public readonly leadId: string,
    public readonly description?: string,
    public readonly startLocation?: string,
    public readonly endLocation?: string,
    public readonly visits?: Array<{
      leadId?: string;
      contactId?: string;
      scheduledTime?: Date;
      sortOrder?: number;
    }>,
  ) {}
}
