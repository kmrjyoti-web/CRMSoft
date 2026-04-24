export class CreateChatbotFlowCommand {
  constructor(
    public readonly wabaId: string,
    public readonly name: string,
    public readonly triggerKeywords: string[],
    public readonly nodes: any,
    public readonly userId: string,
  ) {}
}
