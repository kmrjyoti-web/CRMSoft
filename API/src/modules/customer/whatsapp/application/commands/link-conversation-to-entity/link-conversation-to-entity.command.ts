export class LinkConversationToEntityCommand {
  constructor(
    public readonly conversationId: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly userId: string,
  ) {}
}
