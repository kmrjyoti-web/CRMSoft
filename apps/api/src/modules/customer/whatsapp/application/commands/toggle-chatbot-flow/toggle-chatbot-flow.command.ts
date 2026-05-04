export class ToggleChatbotFlowCommand {
  constructor(
    public readonly flowId: string,
    public readonly status: string,
  ) {}
}
