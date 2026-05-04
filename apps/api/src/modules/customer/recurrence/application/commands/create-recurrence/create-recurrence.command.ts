export class CreateRecurrenceCommand {
  constructor(
    public readonly entityType: string,
    public readonly pattern: string,
    public readonly startDate: Date,
    public readonly createdById: string,
    public readonly templateData: Record<string, any>,
    public readonly entityId?: string,
    public readonly interval?: number,
    public readonly daysOfWeek?: number[],
    public readonly dayOfMonth?: number,
    public readonly endDate?: Date,
    public readonly maxOccurrences?: number,
  ) {}
}
