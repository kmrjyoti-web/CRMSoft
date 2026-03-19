export class GetChatbotFlowsQuery {
  constructor(
    public readonly wabaId: string,
    public readonly status?: string,
  ) {}
}
