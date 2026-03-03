export class UpdateChatbotFlowCommand {
  constructor(
    public readonly flowId: string,
    public readonly name?: string,
    public readonly triggerKeywords?: string[],
    public readonly nodes?: any,
  ) {}
}
