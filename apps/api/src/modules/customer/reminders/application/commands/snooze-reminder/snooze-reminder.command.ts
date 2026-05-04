export class SnoozeReminderCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly snoozedUntil?: Date,
  ) {}
}
