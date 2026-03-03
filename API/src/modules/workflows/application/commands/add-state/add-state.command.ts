export class AddStateCommand {
  constructor(
    public readonly workflowId: string,
    public readonly name: string,
    public readonly code: string,
    public readonly stateType: string,
    public readonly category?: string,
    public readonly color?: string,
    public readonly icon?: string,
    public readonly sortOrder?: number,
    public readonly metadata?: any,
  ) {}
}
