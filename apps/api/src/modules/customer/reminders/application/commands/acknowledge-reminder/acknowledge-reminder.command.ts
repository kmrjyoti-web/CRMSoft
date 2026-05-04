export class AcknowledgeReminderCommand {
  constructor(
    public readonly reminderId: string,
    public readonly userId: string,
  ) {}
}
