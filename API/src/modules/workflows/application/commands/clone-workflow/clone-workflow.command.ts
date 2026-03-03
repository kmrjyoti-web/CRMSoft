export class CloneWorkflowCommand {
  constructor(
    public readonly sourceId: string,
    public readonly createdById: string,
  ) {}
}
