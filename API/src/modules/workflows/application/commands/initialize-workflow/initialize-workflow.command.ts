export class InitializeWorkflowCommand {
  constructor(
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly userId: string,
    public readonly workflowId?: string,
  ) {}
}
