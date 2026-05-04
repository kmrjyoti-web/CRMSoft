export class ResolveConversationCommand {
  constructor(
    public readonly conversationId: string,
    public readonly userId: string,
  ) {}
}
