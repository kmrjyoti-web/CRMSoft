export class SendTextMessageCommand {
  constructor(
    public readonly wabaId: string,
    public readonly conversationId: string,
    public readonly text: string,
    public readonly userId: string,
  ) {}
}
