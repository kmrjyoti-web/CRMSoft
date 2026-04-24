export class SendTemplateMessageCommand {
  constructor(
    public readonly wabaId: string,
    public readonly conversationId: string,
    public readonly templateId: string,
    public readonly variables: any,
    public readonly userId: string,
  ) {}
}
