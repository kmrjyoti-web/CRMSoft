export class GetConversationMessagesQuery {
  constructor(
    public readonly conversationId: string,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
