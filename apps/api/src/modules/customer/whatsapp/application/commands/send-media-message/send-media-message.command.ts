export class SendMediaMessageCommand {
  constructor(
    public readonly wabaId: string,
    public readonly conversationId: string,
    public readonly type: string,
    public readonly mediaUrl: string,
    public readonly caption: string | undefined,
    public readonly userId: string,
  ) {}
}
