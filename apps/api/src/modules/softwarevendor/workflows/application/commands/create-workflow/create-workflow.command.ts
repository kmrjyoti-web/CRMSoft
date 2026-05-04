export class CreateWorkflowCommand {
  constructor(
    public readonly name: string,
    public readonly code: string,
    public readonly entityType: string,
    public readonly createdById: string,
    public readonly description?: string,
    public readonly isDefault?: boolean,
    public readonly configJson?: Record<string, unknown>,
  ) {}
}
