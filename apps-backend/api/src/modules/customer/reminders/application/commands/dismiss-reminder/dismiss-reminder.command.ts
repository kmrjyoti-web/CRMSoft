export class DismissReminderCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
