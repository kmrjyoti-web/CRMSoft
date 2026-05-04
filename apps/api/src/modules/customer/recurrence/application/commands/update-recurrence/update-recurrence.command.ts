export class UpdateRecurrenceCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly data: {
      pattern?: string;
      interval?: number;
      daysOfWeek?: number[];
      dayOfMonth?: number;
      endDate?: Date;
      maxOccurrences?: number;
      templateData?: Record<string, any>;
    },
  ) {}
}
