export class SendInteractiveMessageCommand {
  constructor(
    public readonly wabaId: string,
    public readonly conversationId: string,
    public readonly interactiveType: string,
    public readonly interactiveData: any,
    public readonly userId: string,
  ) {}
}
