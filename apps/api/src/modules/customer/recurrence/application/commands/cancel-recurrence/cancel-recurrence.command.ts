export class CancelRecurrenceCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
