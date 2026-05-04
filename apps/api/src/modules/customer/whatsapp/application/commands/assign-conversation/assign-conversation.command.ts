export class AssignConversationCommand {
  constructor(
    public readonly conversationId: string,
    public readonly assignToUserId: string,
    public readonly userId: string,
  ) {}
}
