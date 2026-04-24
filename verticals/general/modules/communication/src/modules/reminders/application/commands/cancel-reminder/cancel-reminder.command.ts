export class CancelReminderCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
